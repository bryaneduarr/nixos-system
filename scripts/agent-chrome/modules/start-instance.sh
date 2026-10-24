readonly CHROME_BINARY="${AGENT_CHROME_BIN:?AGENT_CHROME_BIN is not set}"
readonly START_POLL_ATTEMPTS=100
readonly START_POLL_INTERVAL=0.15
readonly -a CHROME_BASE_FLAGS=(
  --remote-debugging-address=127.0.0.1
  --no-first-run
  --no-default-browser-check
  --disable-search-engine-choice-screen
  --password-store=basic
  --ozone-platform-hint=auto
)

launch_chrome() {
  local name="$1" port="$2" profile="$3" show_window="$4" url="$5"
  local -a chrome_arguments=(
    "--user-data-dir=$profile"
    "--remote-debugging-port=$port"
    "--class=agent-chrome-$name"
    "${CHROME_BASE_FLAGS[@]}"
  )
  if [[ "$show_window" == false ]]; then
    chrome_arguments+=(--no-startup-window)
  fi
  if [[ -n "$url" ]]; then
    chrome_arguments+=("$url")
  elif [[ "$show_window" == true ]]; then
    chrome_arguments+=(about:blank)
  fi
  ensure_display_environment
  setsid nohup "$CHROME_BINARY" "${chrome_arguments[@]}" >"$STATE_DIR/$name.log" 2>&1 </dev/null &
}

wait_until_responding() {
  local name="$1" port="$2" attempt
  for ((attempt = 0; attempt < START_POLL_ATTEMPTS; attempt++)); do
    if is_responding "$port"; then
      return
    fi
    sleep "$START_POLL_INTERVAL"
  done
  fail "Chrome did not open port $port; see $STATE_DIR/$name.log"
}

start_instance() {
  local name="" url="" show_window=true ephemeral=false clone_source="" port profile
  while (($#)); do
    case "$1" in
      --url)
        url="$2"
        shift 2
        ;;
      --background)
        show_window=false
        shift
        ;;
      --ephemeral)
        ephemeral=true
        shift
        ;;
      --clone-from)
        clone_source="$2"
        shift 2
        ;;
      -*) fail "unknown option $1" ;;
      *)
        name="$1"
        shift
        ;;
    esac
  done
  name="$(resolve_instance_name "$name")"
  mkdir -p "$STATE_DIR" "$PROFILES_DIR"
  chmod 700 "$STATE_DIR" "$PROFILES_DIR"
  if [[ "$ephemeral" == true ]]; then
    mkdir -p "$EPHEMERAL_DIR"
    chmod 700 "$EPHEMERAL_DIR"
    touch "$(instance_marker_file "$name")"
  fi

  port="$(instance_port "$name")"
  profile="$(profile_directory "$name")"
  if is_responding "$port"; then
    echo "$port"
    return
  fi
  if port_in_use "$port"; then
    fail "port $port is taken by another program (delete $(instance_port_file "$name") to reallocate)"
  fi

  if [[ -n "$clone_source" ]]; then
    validate_instance_name "$clone_source"
    if [[ -e "$profile/Default" ]]; then
      notify "profile already exists, not cloning over it"
    else
      notify "cloning profile '$clone_source' into '$name'"
      clone_profile "$(profile_directory "$clone_source")" "$profile"
    fi
  fi
  mkdir -p "$profile"
  chmod 700 "$profile"

  launch_chrome "$name" "$port" "$profile" "$show_window" "$url"
  wait_until_responding "$name" "$port"
  echo "$port"
}
