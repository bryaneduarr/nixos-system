if (($# > 0)); then
  mapfile -t requested_files < <(collect_files_in_paths "$@")
else
  mapfile -t requested_files < <(collect_changed_files)
fi

repository_root=$(git rev-parse --show-toplevel)
cd "$repository_root" || exit 1
mapfile -t target_files < <(printf '%s\n' "${requested_files[@]}" | keep_existing_files)

if ((${#target_files[@]} == 0)); then
  printf 'No files to check.\n'
  exit 0
fi

check_nix_files
check_shell_files
check_typescript_projects
check_lua_files
check_c_files
check_web_files
print_check_summary
