readonly TYPESCRIPT_EXTENSIONS=(ts tsx mts cts js jsx mjs cjs)
readonly LOCAL_KNIP_COMMAND="node_modules/.bin/knip"
readonly RULE_AUDIT_BOUNDARIES_FILE="rule-audit-boundaries.json"

check_typescript_project() {
  local project="$1"
  local has_installed_dependencies=false
  if [[ -d "$project/node_modules" ]]; then
    has_installed_dependencies=true
  fi

  if [[ $has_installed_dependencies == true ]]; then
    run_check "tsc $project" tsc --noEmit --project "$project"
  else
    note_unchecked "tsc and knip in $project (run bun install there)"
  fi

  if [[ -e "$project/biome.json" || -e "$project/biome.jsonc" ]]; then
    run_check "biome $project" run_in_directory "$project" biome ci .
  fi

  if [[ $has_installed_dependencies == true && -e "$project/knip.json" ]]; then
    run_check "knip $project" run_in_directory "$project" "$LOCAL_KNIP_COMMAND"
  fi

  if [[ -e "$project/$RULE_AUDIT_BOUNDARIES_FILE" ]]; then
    run_check "rule-audit $project" rule-audit "$project"
  fi
}

check_typescript_projects() {
  local -a typescript_files
  local -a projects=()
  local file project
  mapfile -t typescript_files < <(select_files_with_extensions "${TYPESCRIPT_EXTENSIONS[@]}")
  for file in "${typescript_files[@]}"; do
    project=$(find_owning_directory tsconfig.json "$(dirname "$file")")
    if [[ -z $project ]]; then
      note_unchecked "$file has no tsconfig.json project"
    else
      projects+=("$project")
    fi
  done
  if ((${#projects[@]} == 0)); then
    return 0
  fi
  mapfile -t projects < <(printf '%s\n' "${projects[@]}" | sort -u)
  for project in "${projects[@]}"; do
    check_typescript_project "$project"
  done
}
