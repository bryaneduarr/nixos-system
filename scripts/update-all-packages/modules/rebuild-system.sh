rebuild_system() {
  echo "  -> Rebuilding the system with nixos-rebuild..."
  sudo nixos-rebuild switch --flake "$flake_ref#nixos" "$@"

  # A shell can cache the old Bun-installed Pi path. The Home Manager activation
  # removes that path, so resolve commands again before checking the new install.
  hash -r 2>/dev/null || true
}
