_: ''
  cmd_status() {
    echo
    e "''${B}''${C}════ OneDrive ''${REMOTE} ════''${R}\n"
    # 1) Service
    e "''${B}  Service ''${D}''${SERVICE}''${R}\n"
    printf '    %-10s' 'state:'
    svc_state; echo
    # 2) Mount
    e "''${B}  Mount ''${D}$MOUNT''${R}\n"
    printf '    %-10s' 'mounted:'
    if is_mounted; then
      local fs
      fs=$(findmnt -n -o FSTYPE "$MOUNT" 2>/dev/null)
      e "''${G}yes''${R} ($fs)"
    else
      e "''${Y}no''${R} (not mounted)"
    fi
    echo
    # 3) Remote / quota
    e "''${B}  Remote ''${R}\n"
    printf '    %-10s' 'reach:'
    local about
    about=$(timeout 20 "$RCLONE" about "$REMOTE:" --config="$CONFIG" 2>/dev/null) || true
    if [ -n "$about" ]; then
      e "''${G}online''${R}\n"
      printf '%s\n' "$about" | sed 's/^/      /'
    else
      e "''${RD}unreachable''${R} (is network up / token valid?)\n"
    fi
    # 4) VFS cache
    e "''${B}  Cache ''${D}''${VFS_DIR}''${R}\n"
    printf '    %-10s' 'usage:'
    local sz
    sz=$(du -sh "$VFS_DIR" 2>/dev/null | awk '{print $1}')
    sz=''${sz:-0B}
    e "''${C}$sz''${R} used  (limit ''${CACHE_LIMIT}, max-age ''${CACHE_AGE})"
    echo
    # 5) Live processes
    e "''${B}  Processes''${R}\n"
    local procs
    procs=$(pgrep -fc 'rclone mount' 2>/dev/null || echo 0)
    printf '    %-10s' 'mount:'
    e "''${D}$procs rclone mount process(es)''${R}\n"
    echo
  }
''
