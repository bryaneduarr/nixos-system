update_flake_inputs() {
  # ---- Update t3code to its latest version ----
  bash "$repo_root/scripts/update-all-packages/packages/t3-code/update-t3code.sh"

  # ---- Update flake inputs, including nixpkgs tools ----
  echo "  -> Running nix flake update..."
  nix flake update --flake "$flake_ref"

  # The flake update may change the Nix npm dependency fetcher, so calculate
  # this hash against the newly locked nixpkgs.
  refresh_pi_npm_hash
}
