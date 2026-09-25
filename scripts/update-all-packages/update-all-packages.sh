#!/usr/bin/env bash
set -euo pipefail

# Update the multiple packages configured in this folder to their latest versions.
script_directory="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

source "$script_directory/modules/repository-context.sh"
source "$script_directory/modules/update-pi-dependencies.sh"
source "$script_directory/modules/refresh-pi-npm-hash.sh"
source "$script_directory/modules/update-flake-inputs.sh"
source "$script_directory/modules/rebuild-system.sh"
source "$script_directory/modules/verify-pi.sh"

update_pi_dependencies
update_flake_inputs
run_with_status "Syncing upstream Pi skills" "Synced upstream Pi skills" \
  bash "$script_directory/modules/sync-pi-skills.sh"
rebuild_system "$@"
verify_pi
