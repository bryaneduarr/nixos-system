target_files=()

keep_existing_files() {
  local file
  while IFS= read -r file; do
    if [[ -f $file ]]; then
      printf '%s\n' "$file"
    fi
  done
}

collect_changed_files() {
  {
    git diff --name-only HEAD
    git ls-files --others --exclude-standard --full-name -- ":/"
  } | sort -u
}

collect_files_in_paths() {
  git ls-files --cached --others --exclude-standard --full-name -- "$@" | sort -u
}

select_files_with_extensions() {
  local file wanted_extension
  for file in "${target_files[@]}"; do
    for wanted_extension in "$@"; do
      if [[ ${file##*.} == "$wanted_extension" ]]; then
        printf '%s\n' "$file"
      fi
    done
  done
}

find_owning_directory() {
  local marker_file="$1"
  local directory="$2"
  while [[ $directory != "." ]]; do
    if [[ -e "$directory/$marker_file" ]]; then
      printf '%s\n' "$directory"
      return 0
    fi
    directory=$(dirname "$directory")
  done
  if [[ -e $marker_file ]]; then
    printf '.\n'
  fi
}
