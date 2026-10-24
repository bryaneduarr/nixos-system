#!/usr/bin/env bash
set -euo pipefail

script_directory="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

source "$script_directory/modules/repository-context.sh"
source "$script_directory/modules/run-with-status.sh"
source "$script_directory/modules/run-quietly.sh"
source "$script_directory/modules/normalize-pi-npm-lock.sh"
source "$script_directory/modules/update-pi-dependencies.sh"
source "$script_directory/modules/refresh-pi-npm-hash.sh"
source "$script_directory/modules/update-flake-inputs.sh"
source "$script_directory/modules/update-antigravity-cli.sh"
source "$script_directory/modules/rebuild-system.sh"
source "$script_directory/modules/update-bun-global-packages.sh"
source "$script_directory/modules/verify-pi.sh"

update_pi_dependencies
update_flake_inputs
update_antigravity_cli
rebuild_system "$@"
run_with_status "Updating Bun global packages and clearing the download cache" "Bun global packages updated and download cache cleared" update_bun_global_packages
verify_pi
