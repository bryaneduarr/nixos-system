target_file="${1:?usage: merge-json-fragment TARGET FRAGMENT}"
fragment_file="${2:?usage: merge-json-fragment TARGET FRAGMENT}"

if [[ ! -d "$(dirname "$target_file")" ]]; then
  exit 0
fi
if [[ ! -s "$target_file" ]]; then
  echo '{}' >"$target_file"
fi
if ! jq empty "$target_file" 2>/dev/null; then
  echo "merge-json-fragment: $target_file is not plain JSON, leaving it unchanged" >&2
  exit 0
fi

temporary_file="$(mktemp "$target_file.XXXXXX")"
jq -s '.[0] * .[1]' "$target_file" "$fragment_file" >"$temporary_file"
chmod --reference="$target_file" "$temporary_file"
mv "$temporary_file" "$target_file"
