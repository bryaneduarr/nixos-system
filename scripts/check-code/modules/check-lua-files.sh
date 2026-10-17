check_lua_files() {
  local -a lua_files
  local -a lua_projects=()
  local file project neovim_runtime log_directory
  mapfile -t lua_files < <(select_files_with_extensions lua)
  if ((${#lua_files[@]} == 0)); then
    return 0
  fi
  run_check "stylua" stylua --check --search-parent-directories "${lua_files[@]}"

  for file in "${lua_files[@]}"; do
    project=$(find_owning_directory .luarc.json "$(dirname "$file")")
    if [[ -z $project ]]; then
      note_unchecked "$file has no .luarc.json project"
    else
      lua_projects+=("$project")
    fi
  done
  if ((${#lua_projects[@]} == 0)); then
    return 0
  fi

  neovim_runtime=$(nvim --clean --headless "+lua io.write(vim.env.VIMRUNTIME)" +qa)
  log_directory=$(mktemp --directory)
  mapfile -t lua_projects < <(printf '%s\n' "${lua_projects[@]}" | sort -u)
  for project in "${lua_projects[@]}"; do
    run_check "lua-language-server $project" env VIMRUNTIME="$neovim_runtime" \
      lua-language-server --check "$project" --checklevel=Information --logpath "$log_directory"
  done
  rm -rf "$log_directory"
}
