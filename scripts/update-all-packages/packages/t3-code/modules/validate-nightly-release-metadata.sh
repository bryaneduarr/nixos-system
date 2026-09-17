if [[ -z "$version" || "$version" == "null" || ! "$hash" =~ ^sha256- ]]; then
  printf 'Could not read T3 Code nightly release metadata.\n' >&2
  exit 1
fi
