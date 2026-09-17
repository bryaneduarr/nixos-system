# buildNpmPackage hashes the complete package-lock dependency tree. Ask Nix
# for the new fixed-output hash, then build once more with that hash recorded.
refresh_pi_npm_hash() {
  local build_output new_hash

  sed -i 's|^  npmDepsHash = ".*";|  npmDepsHash = lib.fakeHash;|' "$pi_nix_file"

  set +e
  build_output="$(nix build --no-link --impure "$flake_ref#pi-tools" 2>&1)"
  local build_status=$?
  set -e

  new_hash="$(printf '%s\n' "$build_output" | sed -n 's/.*got:[[:space:]]*//p' | tr -d '[:space:]' | tail -n 1)"
  if [ -z "$new_hash" ]; then
    printf '%s\n' "$build_output" >&2
    echo "  !! Could not calculate the Pi npm dependency hash." >&2
    return "${build_status:-1}"
  fi

  sed -i "s|^  npmDepsHash = lib.fakeHash;|  npmDepsHash = \"$new_hash\";|" "$pi_nix_file"
  echo "  -> Pi npm dependency hash updated."
}
