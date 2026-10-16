B=$'\033[1m'; R=$'\033[0m'
G=$'\033[32m'; Y=$'\033[33m'; RD=$'\033[31m'; C=$'\033[36m'
D=$'\033[2m'

e() { printf '%b' "$1"; }

svc_active() { systemctl --user is-active "$SERVICE" >/dev/null 2>&1; }
is_mounted() { findmnt -n "$MOUNT" >/dev/null 2>&1; }

svc_state() {
  local s
  s=$(systemctl --user is-active "$SERVICE" 2>/dev/null)
  case "$s" in
    active)     e "${G}active${R}" ;;
    activating) e "${Y}activating${R}" ;;
    inactive)   e "${Y}inactive${R}" ;;
    failed)     e "${RD}failed${R}" ;;
    *)          e "${D}${s}${R}" ;;
  esac
}

cmd_status() {
  echo
  e "${B}${C}════ OneDrive ${REMOTE} ════${R}\n"
  e "${B}  Service ${D}${SERVICE}${R}\n"
  printf '    %-10s' 'state:'
  svc_state; echo
  e "${B}  Mount ${D}$MOUNT${R}\n"
  printf '    %-10s' 'mounted:'
  if is_mounted; then
    local fs
    fs=$(findmnt -n -o FSTYPE "$MOUNT" 2>/dev/null)
    e "${G}yes${R} ($fs)"
  else
    e "${Y}no${R} (not mounted)"
  fi
  echo
  e "${B}  Remote ${R}\n"
  printf '    %-10s' 'reach:'
  local about
  about=$(timeout 20 "$RCLONE" about "$REMOTE:" --config="$CONFIG" 2>/dev/null) || true
  if [ -n "$about" ]; then
    e "${G}online${R}\n"
    printf '%s\n' "$about" | sed 's/^/      /'
  else
    e "${RD}unreachable${R} (is network up / token valid?)\n"
  fi
  e "${B}  Cache ${D}${VFS_DIR}${R}\n"
  printf '    %-10s' 'usage:'
  local sz
  sz=$(du -sh "$VFS_DIR" 2>/dev/null | awk '{print $1}')
  sz=${sz:-0B}
  e "${C}$sz${R} used  (limit ${CACHE_LIMIT}, max-age ${CACHE_AGE})"
  echo
  e "${B}  Processes${R}\n"
  local procs
  procs=$(pgrep -fc 'rclone mount' 2>/dev/null || echo 0)
  printf '    %-10s' 'mount:'
  e "${D}$procs rclone mount process(es)${R}\n"
  echo
}

cmd_stop() {
  if ! svc_active && ! is_mounted; then
    e "${Y}OneDrive is already stopped / not connected.${R}\n"
    return 0
  fi
  systemctl --user stop "$SERVICE" >/dev/null 2>&1 || true
  # The mount may exist outside the systemd service.
  if is_mounted; then
    "$RCLONE" umount "$MOUNT" >/dev/null 2>&1 || true
  fi
  e "${G}OneDrive unmounted and disconnected.${R}\n"
}

cmd_start() {
  if is_mounted; then
    e "${Y}OneDrive is already connected (mounted) — doing nothing.${R}\n"
    return 0
  fi
  if svc_active; then
    systemctl --user restart "$SERVICE" >/dev/null 2>&1
  else
    systemctl --user start "$SERVICE" >/dev/null 2>&1
  fi
  for _ in $(seq 1 120); do
    is_mounted && break
    sleep 1
  done
  if is_mounted; then
    e "${G}Connected.${R} $MOUNT is live.\n"
  else
    e "${RD}Failed to mount${R} — check: systemctl --user status $SERVICE\n"
    return 1
  fi
}

cmd="${1:-}"
case "$cmd" in
  status)  cmd_status ;;
  start)   cmd_start ;;
  stop)    cmd_stop ;;
  restart) cmd_stop; cmd_start ;;
  help|-h|--help)
    echo "usage: onedrive {status|start|stop|restart}";;
  *)
    echo "onedrive: unknown subcommand '$cmd'" >&2
    echo "usage: onedrive {status|start|stop|restart}" >&2
    exit 1 ;;
esac
