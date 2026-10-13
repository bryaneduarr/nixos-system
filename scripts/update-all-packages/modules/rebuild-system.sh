_rebuild_system() {
  run_quietly sudo nixos-rebuild switch --flake "$flake_ref#$rebuild_target" "${build_limit_args[@]}" "$@"

  # A shell can cache the old Bun-installed Pi path. The Home Manager activation
  # removes that path, so resolve commands again before checking the new install.
  hash -r 2>/dev/null || true
}

rebuild_system() {
  run_with_status "Rebuilding the system" "Rebuilt the system" _rebuild_system "$@"
}
