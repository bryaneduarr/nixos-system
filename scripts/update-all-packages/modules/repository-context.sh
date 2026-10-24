# shellcheck disable=SC2154,SC2034
# Sourced by update-all-packages.sh, which sets script_directory; sibling modules read pi_nix_file.
repo_root="$(cd -- "$script_directory/../.." && pwd)"
flake_ref="path:$repo_root"
source "$repo_root/scripts/system-target/select-target.sh"
select_system_target
show_system_target

pi_nix_file="$repo_root/packages/pi/pi-tools/pi-tools.nix"
