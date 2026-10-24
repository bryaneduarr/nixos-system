list_instances() {
  local name port state kind
  printf '%-22s %-6s %-9s %-10s %s\n' NAME PORT STATE KIND PROFILE
  while read -r name; do
    port="$(cat "$(instance_port_file "$name")")"
    state=stopped
    if is_responding "$port"; then
      state=running
    fi
    kind=persistent
    if is_ephemeral_instance "$name"; then
      kind=ephemeral
    fi
    printf '%-22s %-6s %-9s %-10s %s\n' "$name" "$port" "$state" "$kind" "$(profile_directory "$name")"
  done < <(list_instance_names)
}

show_instance_status() {
  local name port
  name="$(resolve_instance_name "${1:-}")"
  if [[ ! -s "$(instance_port_file "$name")" ]]; then
    echo "$name: not created"
    return 1
  fi
  port="$(cat "$(instance_port_file "$name")")"
  if ! is_responding "$port"; then
    echo "$name: stopped (port $port reserved)"
    return 1
  fi
  echo "$name: running on 127.0.0.1:$port"
  curl -fsS "http://127.0.0.1:$port/json/version" | jq -r '"  \(.Browser)"'
}

show_instance_url() {
  echo "http://127.0.0.1:$(running_instance_port "${1:-}")"
}

open_instance_window() {
  local name url="${2:-about:blank}"
  name="$(resolve_instance_name "${1:-}")"
  ensure_display_environment
  setsid nohup "$CHROME_BINARY" "--user-data-dir=$(profile_directory "$name")" "$url" >/dev/null 2>&1 </dev/null &
}
