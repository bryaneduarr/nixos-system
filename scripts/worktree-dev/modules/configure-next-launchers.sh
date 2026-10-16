configure_next_launchers() {
  for spec in "client:$client_port" "web:$web_port" "admin:$admin_port"; do
    app="${spec%%:*}"
    port="${spec##*:}"
    launcher="$repo_root/apps/$app/node_modules/.bin/next"

    unlink "$launcher" 2>/dev/null || true
    unlink "$launcher.worktree-original" 2>/dev/null || true
    printf '#!/bin/sh\nexec "%s" dev --turbopack -p %s\n' "$next_binary" "$port" > "$launcher"
    chmod 755 "$launcher"
  done
}
