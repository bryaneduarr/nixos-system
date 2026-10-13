update_bun_global_packages() (
  set -euo pipefail

  export BUN_INSTALL="$HOME/.bun"
  install -d -m 700 "$HOME/.cache"
  exec 9>"$HOME/.cache/bun-maintenance.lock"
  flock 9

  trap 'bun pm --global cache rm' EXIT
  bun update --global --latest --no-cache
)
