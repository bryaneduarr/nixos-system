#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
flake_ref="path:$repo_root"

nix flake update --flake "$flake_ref"
sudo nixos-rebuild switch --flake "$flake_ref#nixos" "$@"
