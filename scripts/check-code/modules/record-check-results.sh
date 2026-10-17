failed_checks=()
unchecked_notes=()

run_check() {
  local check_name="$1"
  shift
  printf '==> %s\n' "$check_name"
  if ! "$@"; then
    failed_checks+=("$check_name")
  fi
}

run_in_directory() {
  local directory="$1"
  shift
  (cd "$directory" && "$@")
}

note_unchecked() {
  unchecked_notes+=("$1")
}

print_check_summary() {
  local note check_name
  for note in "${unchecked_notes[@]}"; do
    printf 'unchecked: %s\n' "$note"
  done
  if ((${#failed_checks[@]} > 0)); then
    for check_name in "${failed_checks[@]}"; do
      printf 'failed: %s\n' "$check_name" >&2
    done
    return 1
  fi
  printf 'All checks passed.\n'
}
