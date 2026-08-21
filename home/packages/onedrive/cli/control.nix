_: ''
  cmd_stop() {
    if ! svc_active && ! is_mounted; then
      e "''${Y}OneDrive is already stopped / not connected.''${R}\n"
      return 0
    fi
    systemctl --user stop "$SERVICE" >/dev/null 2>&1 || true
    # unmount in case it was mounted outside the systemd service
    if is_mounted; then
      "$RCLONE" umount "$MOUNT" >/dev/null 2>&1 || true
    fi
    e "''${G}OneDrive unmounted and disconnected.''${R}\n"
  }

  cmd_start() {
    if is_mounted; then
      e "''${Y}OneDrive is already connected (mounted) — doing nothing.''${R}\n"
      return 0
    fi
    if svc_active; then
      systemctl --user restart "$SERVICE" >/dev/null 2>&1
    else
      systemctl --user start "$SERVICE" >/dev/null 2>&1
    fi
    local i
    for i in $(seq 1 120); do
      is_mounted && break
      sleep 1
    done
    if is_mounted; then
      e "''${G}Connected.''${R} $MOUNT is live.\n"
    else
      e "''${RD}Failed to mount''${R} — check: systemctl --user status $SERVICE\n"
      return 1
    fi
  }
''
