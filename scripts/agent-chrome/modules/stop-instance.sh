readonly STOP_POLL_ATTEMPTS=50
readonly STOP_POLL_INTERVAL=0.1
readonly WATCH_POLL_INTERVAL=3

terminate_process() {
  local process_id="$1" attempt
  kill -TERM "$process_id"
  for ((attempt = 0; attempt < STOP_POLL_ATTEMPTS; attempt++)); do
    if ! kill -0 "$process_id" 2>/dev/null; then
      return
    fi
    sleep "$STOP_POLL_INTERVAL"
  done
  kill -KILL "$process_id"
}

remove_ephemeral_state() {
  rm -rf "${EPHEMERAL_DIR:?}/$1" "$STATE_DIR/$1".{port,ephemeral,log}
}

stop_one_instance() {
  local name="$1" purge="$2" port process_id
  [[ -s "$(instance_port_file "$name")" ]] || return 0
  port="$(cat "$(instance_port_file "$name")")"
  process_id="$(listening_process_id "$port")"
  if [[ -n "$process_id" ]]; then
    terminate_process "$process_id"
    notify "stopped '$name' (port $port)"
  fi
  if is_ephemeral_instance "$name"; then
    remove_ephemeral_state "$name"
  elif [[ "$purge" == true ]]; then
    rm -rf "${PROFILES_DIR:?}/$name" "$STATE_DIR/$name".{port,log}
    notify "deleted profile '$name'"
  fi
}

stop_instances() {
  local purge=false stop_all=false name="" target
  local -a targets=()
  while (($#)); do
    case "$1" in
      --purge) purge=true ;;
      --all) stop_all=true ;;
      *) name="$1" ;;
    esac
    shift
  done
  if [[ "$stop_all" == true ]]; then
    mapfile -t targets < <(list_instance_names)
  else
    targets=("$(resolve_instance_name "$name")")
  fi
  for target in "${targets[@]}"; do
    stop_one_instance "$target" "$purge"
  done
}

stop_when_process_exits() {
  local watched_process_id="$1" name
  name="$(resolve_instance_name "$2")"
  while kill -0 "$watched_process_id" 2>/dev/null; do
    sleep "$WATCH_POLL_INTERVAL"
  done
  stop_one_instance "$name" false
}

remove_dead_ephemeral_instances() {
  local name
  while read -r name; do
    if is_ephemeral_instance "$name" && ! is_responding "$(cat "$(instance_port_file "$name")")"; then
      remove_ephemeral_state "$name"
      notify "removed dead ephemeral '$name'"
    fi
  done < <(list_instance_names)
}
