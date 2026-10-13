nrs() {
  bash "$HOME/nixos-system/scripts/system-target/rebuild.sh" "$@"
}

nfu() {
  bash "$HOME/nixos-system/scripts/update-all-packages/update-all-packages.sh" "$@"
}
