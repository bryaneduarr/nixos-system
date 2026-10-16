check_nix_files() {
  local -a nix_files
  local file
  mapfile -t nix_files < <(select_files_with_extensions nix)
  if ((${#nix_files[@]} == 0)); then
    return 0
  fi
  run_check "nil diagnostics" nil diagnostics --deny-warnings "${nix_files[@]}"
  run_check "nixfmt" nixfmt --check "${nix_files[@]}"
  run_check "deadnix" deadnix --fail "${nix_files[@]}"
  for file in "${nix_files[@]}"; do
    run_check "statix $file" statix check "$file"
  done
}
