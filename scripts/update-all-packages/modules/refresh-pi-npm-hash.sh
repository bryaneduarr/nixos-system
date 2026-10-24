refresh_pi_npm_hash() {
  # buildNpmPackage hashes the whole lock tree, so ask Nix for the new hash and rebuild with it.
  local build_output new_hash original_hash_line

  original_hash_line="$(sed -n 's/^[[:space:]]*npmDepsHash = \(.*\);$/\1/p' "$pi_nix_file")"

  sed -i -E 's|^([[:space:]]*)npmDepsHash = ".*";|\1npmDepsHash = lib.fakeHash;|' "$pi_nix_file"

  set +e
  build_output="$(nix build --no-link --impure "$flake_ref#packages.$rebuild_system_architecture.pi-tools" "${build_limit_args[@]}" 2>&1)"
  set -e

  new_hash="$(printf '%s\n' "$build_output" | sed -n 's/.*got:[[:space:]]*//p' | tr -d '[:space:]' | tail -n 1)"
  # Nix returns nonzero for the intentional fake-hash mismatch. The `got:`
  # value is the successful result we need from that build.
  if [[ ! "$new_hash" =~ ^sha256- ]]; then
    if [ -n "$original_hash_line" ]; then
      sed -i -E "s|^([[:space:]]*)npmDepsHash = lib\.fakeHash;|\1npmDepsHash = $original_hash_line;|" "$pi_nix_file"
    fi
    printf '%s\n' "$build_output" >&2
    echo "!! Could not calculate the Pi npm dependency hash." >&2
    return 1
  fi

  sed -i -E "s|^([[:space:]]*)npmDepsHash = lib\.fakeHash;|\1npmDepsHash = \"$new_hash\";|" "$pi_nix_file"
}
