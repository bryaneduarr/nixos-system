cleanup() {
  for app in client web admin; do
    launcher="$repo_root/apps/$app/node_modules/.bin/next"
    unlink "$launcher" 2>/dev/null || true
    unlink "$launcher.worktree-original" 2>/dev/null || true
    ln -s "$next_binary" "$launcher"
  done

  unlink "$server_env" 2>/dev/null || true
  case "$env_state" in
    link) ln -s "$original_env_target" "$server_env" ;;
    file) mv "$runtime_dir/original.env" "$server_env" ;;
  esac

  unlink "$runtime_dir/server.env" 2>/dev/null || true
  rmdir "$runtime_dir" 2>/dev/null || true
}
