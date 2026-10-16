check_shell_files() {
  local -a shell_files
  mapfile -t shell_files < <(select_files_with_extensions sh bash)
  if ((${#shell_files[@]} == 0)); then
    return 0
  fi
  run_check "shellcheck" shellcheck "${shell_files[@]}"
  run_check "shfmt" shfmt -d "${shell_files[@]}"
}
