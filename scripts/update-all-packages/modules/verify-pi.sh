_verify_pi() {
  local executable

  for executable in pi ast-grep knip biome vtsls tsc; do
    if ! command -v "$executable" >/dev/null; then
      printf 'Required executable is missing: %s\n' "$executable" >&2
      return 1
    fi

    if ! timeout 15 "$executable" --version >/dev/null; then
      printf 'Could not read the version of %s.\n' "$executable" >&2
      return 1
    fi
  done
}

verify_pi() {
  run_with_status "Checking installed Pi tools" "Pi tools are installed" _verify_pi
}
