ensure_display_environment() {
  local wayland_socket
  export XDG_RUNTIME_DIR="${XDG_RUNTIME_DIR:-/run/user/$(id -u)}"
  if [[ -z "${WAYLAND_DISPLAY:-}" ]]; then
    wayland_socket="$(find "$XDG_RUNTIME_DIR" -maxdepth 1 -name 'wayland-[0-9]*' ! -name '*.lock' ! -name '*.sock' -printf '%f\n' | sort | sed -n 1p)"
    if [[ -n "$wayland_socket" ]]; then
      export WAYLAND_DISPLAY="$wayland_socket"
    fi
  fi
  export DISPLAY="${DISPLAY:-:0}"
  if [[ -z "${DBUS_SESSION_BUS_ADDRESS:-}" && -S "$XDG_RUNTIME_DIR/bus" ]]; then
    export DBUS_SESSION_BUS_ADDRESS="unix:path=$XDG_RUNTIME_DIR/bus"
  fi
}
