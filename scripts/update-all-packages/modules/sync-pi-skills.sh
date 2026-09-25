#!/usr/bin/env bash
# Sync complete skill directories from the refs listed in upstream-sources.tsv.
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd -- "$script_dir/../../.." && pwd)"
manifest="${1:-$repo_root/home/packages/pi/agent-configuration/skills/upstream-sources.tsv}"
destination="${2:-$repo_root/home/packages/pi/agent-configuration/skills/upstream}"
staging="$(mktemp -d)"
trap 'rm -rf -- "$staging"' EXIT

mkdir -p "$staging/checkouts" "$staging/skills"
declare -a names=()
declare -A seen=()

while IFS=$'\t' read -r repository ref skill_path extra || [[ -n "${repository:-}" ]]; do
  [[ -z "$repository" || "$repository" == \#* ]] && continue
  if [[ -z "$ref" || -z "$skill_path" || -n "${extra:-}" ||
        ! "$skill_path" =~ ^[a-zA-Z0-9._/-]+$ ||
        "$skill_path" == /* || "$skill_path" == */ ||
        "/$skill_path/" == *'/../'* || "/$skill_path/" == *'/./'* ||
        "$skill_path" == *//* ]]; then
    echo "Invalid skill source: $repository $ref $skill_path" >&2
    exit 1
  fi

  name="${skill_path##*/}"
  if [[ ! "$name" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ || -n "${seen[$name]:-}" ]]; then
    echo "Invalid or duplicate skill name: $name" >&2
    exit 1
  fi
  seen[$name]=1
  names+=("$name")

  checkout="$staging/checkouts/$name"
  git clone --quiet --depth 1 --filter=blob:none --sparse --branch "$ref" -- "$repository" "$checkout"
  git -C "$checkout" sparse-checkout set -- "$skill_path"
  source_dir="$checkout/$skill_path"
  if [[ ! -d "$source_dir" || -L "$source_dir" ||
        "$(realpath -- "$source_dir")" != "$checkout/"* ||
        ! -f "$source_dir/SKILL.md" || -L "$source_dir/SKILL.md" ]]; then
    echo "Missing regular SKILL.md: $repository ($ref) $skill_path" >&2
    exit 1
  fi

  mkdir -p "$staging/skills/$name"
  cp -R -- "$source_dir/." "$staging/skills/$name/"
  if [[ -n "$(find "$staging/skills/$name" -type l -print -quit)" ]] ||
     ! grep -Eq "^name: ['\"]?$name['\"]?[[:space:]]*$" "$staging/skills/$name/SKILL.md"; then
    echo "Unsafe files or mismatched skill name: $repository ($ref) $skill_path" >&2
    exit 1
  fi
  printf '%s: %s\n' "$name" "$(git -C "$checkout" rev-parse --short HEAD)"
done < "$manifest"

# Do not replace any installed skill until every source has been fetched and checked.
mkdir -p "$destination"
for name in "${names[@]}"; do
  if [[ -d "$destination/$name" ]] && diff -qr "$staging/skills/$name" "$destination/$name" >/dev/null; then
    continue
  fi
  rm -rf -- "$destination/$name"
  mv -- "$staging/skills/$name" "$destination/$name"
done
