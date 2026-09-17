repo_root="$(cd -- "$script_directory/../.." && pwd)"
flake_ref="path:$repo_root"
pi_nix_file="$repo_root/home/packages/pi/pi-tools/default.nix"

# Run package-manager commands quietly, but preserve their diagnostics on failure.
run_quietly() {
  local log_file status
  log_file="$(mktemp)"
  set +e
  "$@" >"$log_file" 2>&1
  status=$?
  set -e
  if [ "$status" -ne 0 ]; then
    cat "$log_file" >&2
    rm -f "$log_file"
    return "$status"
  fi
  rm -f "$log_file"
}
