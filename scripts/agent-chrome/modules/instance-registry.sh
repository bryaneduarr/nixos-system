readonly PROFILES_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/agent-chrome/profiles"
readonly STATE_DIR="${XDG_STATE_HOME:-$HOME/.local/state}/agent-chrome"
readonly EPHEMERAL_DIR="${XDG_RUNTIME_DIR:-/tmp}/agent-chrome"
readonly PORT_RANGE_START=9300
readonly PORT_RANGE_SIZE=400

readonly INSTANCE_NAME_PATTERN='^[a-z0-9][a-z0-9_-]{0,40}$'

fail() {
  echo "agent-chrome: $*" >&2
  exit 1
}

notify() {
  echo "agent-chrome: $*" >&2
}

validate_instance_name() {
  [[ "$1" =~ $INSTANCE_NAME_PATTERN ]] || fail "invalid instance name '$1' (use a-z 0-9 _ -)"
}

resolve_instance_name() {
  local name="${1:-${AGENT_CHROME_INSTANCE:-default}}"
  validate_instance_name "$name"
  echo "$name"
}

instance_port_file() {
  echo "$STATE_DIR/$1.port"
}

instance_marker_file() {
  echo "$STATE_DIR/$1.ephemeral"
}

is_ephemeral_instance() {
  [[ -f "$(instance_marker_file "$1")" ]]
}

profile_directory() {
  if is_ephemeral_instance "$1"; then
    echo "$EPHEMERAL_DIR/$1"
  else
    echo "$PROFILES_DIR/$1"
  fi
}

list_instance_names() {
  local port_file name
  for port_file in "$STATE_DIR"/*.port; do
    if [[ -e "$port_file" ]]; then
      name="${port_file##*/}"
      echo "${name%.port}"
    fi
  done
}

port_in_use() {
  [[ -n "$(ss -H -ltn "sport = :$1")" ]]
}

is_responding() {
  curl -fsS --max-time 2 "http://127.0.0.1:$1/json/version" >/dev/null 2>&1
}

listening_process_id() {
  ss -H -ltnp "sport = :$1" | sed -n '1s/.*pid=\([0-9]*\).*/\1/p'
}

reserved_ports() {
  local port_file
  for port_file in "$STATE_DIR"/*.port; do
    if [[ -e "$port_file" ]]; then
      cat "$port_file"
    fi
  done
}

claim_free_port() {
  local name="$1" reserved candidate
  reserved=" $(reserved_ports | tr '\n' ' ') "
  for ((candidate = PORT_RANGE_START; candidate < PORT_RANGE_START + PORT_RANGE_SIZE; candidate++)); do
    if [[ "$reserved" == *" $candidate "* ]] || port_in_use "$candidate"; then
      continue
    fi
    echo "$candidate" >"$(instance_port_file "$name")"
    echo "$candidate"
    return
  done
  fail "no free port in $PORT_RANGE_START-$((PORT_RANGE_START + PORT_RANGE_SIZE - 1))"
}

instance_port() {
  local name="$1" port_file
  port_file="$(instance_port_file "$name")"
  if [[ -s "$port_file" ]]; then
    cat "$port_file"
    return
  fi
  (
    flock 9
    claim_free_port "$name"
  ) 9>"$STATE_DIR/allocate.lock"
}

running_instance_port() {
  local name port
  name="$(resolve_instance_name "${1:-}")"
  [[ -s "$(instance_port_file "$name")" ]] || fail "instance '$name' does not exist (agent-chrome start $name)"
  port="$(cat "$(instance_port_file "$name")")"
  is_responding "$port" || fail "instance '$name' is not running (agent-chrome start $name)"
  echo "$port"
}
