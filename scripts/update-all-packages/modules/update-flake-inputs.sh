_update_flake_inputs() {
  # ---- Update flake inputs, including nixpkgs tools ----
  run_quietly nix flake update --flake "$flake_ref"

  # The flake update may change the Nix npm dependency fetcher, so calculate
  # this hash against the newly locked nixpkgs.
  refresh_pi_npm_hash
}

update_flake_inputs() {
  run_with_status \
    "Updating flake inputs" \
    "Updated flake inputs" \
    _update_flake_inputs
}
