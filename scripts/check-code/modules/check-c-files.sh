readonly C_EXTENSIONS=(c h cc cpp cxx hpp hxx)

check_c_files() {
  local -a c_files
  local file compile_database_directory
  mapfile -t c_files < <(select_files_with_extensions "${C_EXTENSIONS[@]}")
  for file in "${c_files[@]}"; do
    compile_database_directory=$(find_owning_directory compile_commands.json "$(dirname "$file")")
    if [[ -z $compile_database_directory ]]; then
      note_unchecked "$file has no compile_commands.json"
    else
      run_check "clang-tidy $file" clang-tidy -p "$compile_database_directory" "$file"
    fi
  done
}
