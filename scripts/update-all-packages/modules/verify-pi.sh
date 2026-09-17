verify_pi() {
  local verify_log
  verify_log="$(mktemp)"

  # Keep successful verification completely quiet. The subshell gives the
  # checks fail-fast behavior while allowing us to replay diagnostics only on
  # failure.
  if ! (
    set -e
    local rpc_output command_name typecheck_smoke_file

    command -v pi >/dev/null
    pi --version >/dev/null
    grep -q 'registerCommand("clear"' "$repo_root/home/packages/pi/agent-configuration/clear-session-extension.ts"
    rpc_output="$(printf '%s\n' \
      '{"id":"lsp-status","type":"prompt","message":"/lsp status"}' \
      '{"id":"ast-grep-check","type":"prompt","message":"/ast-grep-check"}' \
      '{"id":"clear","type":"prompt","message":"/clear"}' \
      '{"type":"get_state"}' \
      | timeout 45 pi --offline --no-session --mode rpc 2>&1)"

    if printf '%s\n' "$rpc_output" | grep -Eiq 'failed to load extension|cannot find module|extension error'; then
      printf '%s\n' "$rpc_output"
      echo "  !! Pi reported an extension loading error."
      exit 1
    fi

    for command_name in lsp-status ast-grep-check; do
      if ! printf '%s\n' "$rpc_output" | grep -Fq "\"id\":\"$command_name\""; then
        printf '%s\n' "$rpc_output"
        echo "  !! Pi did not answer the $command_name check."
        exit 1
      fi
    done

    ast-grep --version >/dev/null
    knip --version >/dev/null
    biome --version >/dev/null
    vtsls --version >/dev/null

    if [ -f "$PWD/tsconfig.json" ]; then
      tsc --noEmit
    else
      typecheck_smoke_file="$(mktemp --suffix=.ts)"
      trap 'rm -f "$typecheck_smoke_file"' EXIT
      printf 'const typecheckSmoke: string = "ok";\n' > "$typecheck_smoke_file"
      tsc --noEmit --strict --skipLibCheck "$typecheck_smoke_file"
    fi
  ) >"$verify_log" 2>&1; then
    cat "$verify_log" >&2
    rm -f "$verify_log"
    return 1
  fi

  rm -f "$verify_log"
}
