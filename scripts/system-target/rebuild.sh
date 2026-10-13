#!/usr/bin/env bash
set -euo pipefail

script_directory="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd -- "$script_directory/../.." && pwd)"
flake_ref="path:$repo_root"

source "$script_directory/select-target.sh"
select_system_target
show_system_target

rebuild_action=switch
case "${1:-}" in
  build|dry-build)
    rebuild_action="$1"
    shift
    ;;
esac

exec sudo nixos-rebuild "$rebuild_action" --flake "$flake_ref#$rebuild_target" "${build_limit_args[@]}" "$@"
