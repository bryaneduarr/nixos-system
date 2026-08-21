{ cfg, config }:
''
  set -u

  SERVICE="onedrive-mount.service"
  MOUNT="${cfg.mountPoint}"
  RCLONE="${cfg.package}/bin/rclone"
  REMOTE="${cfg.remote}"
  CONFIG="${config.home.homeDirectory}/.config/rclone/rclone.conf"
  VFS_DIR="${config.home.homeDirectory}/.cache/rclone/vfs"
  CACHE_LIMIT="${cfg.vfsCacheMaxSize}"
  CACHE_AGE="${cfg.vfsCacheMaxAge}"

  # ANSI colours
  B=$'\033[1m'; R=$'\033[0m'
  G=$'\033[32m'; Y=$'\033[33m'; RD=$'\033[31m'; C=$'\033[36m'
  M=$'\033[35m'; D=$'\033[2m'

  e() { printf '%b' "$1"; }

  svc_active() { systemctl --user is-active "$SERVICE" >/dev/null 2>&1; }
  is_mounted() { findmnt -n "$MOUNT" >/dev/null 2>&1; }

  svc_state() {
    local s
    s=$(systemctl --user is-active "$SERVICE" 2>/dev/null)
    case "$s" in
      active)     e "''${G}active''${R}" ;;
      activating) e "''${Y}activating''${R}" ;;
      inactive)   e "''${Y}inactive''${R}" ;;
      failed)     e "''${RD}failed''${R}" ;;
      *)          e "''${D}''${s}''${R}" ;;
    esac
  }
''
