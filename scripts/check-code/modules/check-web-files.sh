check_web_files() {
  local -a css_files html_files
  local file
  mapfile -t css_files < <(select_files_with_extensions css)
  mapfile -t html_files < <(select_files_with_extensions html htm)
  if ((${#css_files[@]} > 0)); then
    run_check "biome css" biome ci "${css_files[@]}"
  fi
  for file in "${html_files[@]}"; do
    note_unchecked "$file (HTML has no command-line diagnostics)"
  done
}
