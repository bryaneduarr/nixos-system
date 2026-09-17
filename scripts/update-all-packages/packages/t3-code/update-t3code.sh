#!/usr/bin/env bash
set -euo pipefail

script_directory="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

source "$script_directory/modules/resolve-update-context.sh"
source "$script_directory/modules/fetch-nightly-release-metadata.sh"
source "$script_directory/modules/download-nightly-appimage.sh"
source "$script_directory/modules/validate-nightly-release-metadata.sh"
source "$script_directory/modules/update-t3code-package-file.sh"
