normalize_pi_npm_lock_integrity() {
  local lockfile="${1:?A Pi package-lock.json path is required}"
  local module_directory

  module_directory="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
  node "$module_directory/normalize-pi-npm-lock.cjs" "$lockfile"
}
