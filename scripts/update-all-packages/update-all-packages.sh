#!/usr/bin/env bash
set -euo pipefail

script_directory="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

source "$script_directory/modules/repository-context.sh"
source "$script_directory/modules/update-pi-dependencies.sh"
source "$script_directory/modules/refresh-pi-npm-hash.sh"
source "$script_directory/modules/update-flake-inputs.sh"
source "$script_directory/modules/rebuild-system.sh"
source "$script_directory/modules/verify-pi.sh"

update_pi_dependencies
update_flake_inputs
rebuild_system "$@"
verify_pi
