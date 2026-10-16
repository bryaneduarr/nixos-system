{
  pkgs,
  cases,
  prepare ? "",
  inspectFile ? null,
}:
let
  inherit (pkgs) lib;

  defaultEnvironment = {
    TEST_HOST = "Linux";
    TEST_HOSTNAME = "nixos";
    TEST_ARCH = "x86_64";
    TEST_RELEASE = "6.12.0";
  };

  stub = name: body: ''
    cat > "$stubs/${name}" <<'STUB'
    #!${lib.getExe pkgs.bash}
    printf '%s\0' "${name}" "$@" | jq -cRs 'split("\u0000") | .[:-1]' >> "$COMMAND_LOG"
    ${body}
    STUB
    chmod +x "$stubs/${name}"
  '';

  runCase =
    name:
    {
      env ? { },
      command,
      ...
    }:
    let
      assignments = lib.mapAttrsToList (key: value: "${key}=${value}") (defaultEnvironment // env);
    in
    "run_case ${lib.escapeShellArgs ([ name ] ++ assignments ++ command)}\n";

  check =
    pkgs.runCommand "stubbed-script-check"
      {
        nativeBuildInputs = [ pkgs.jq ];
      }
      ''
        stubs="$PWD/stubs"
        repo="$PWD/nixos-system"
        log="$PWD/commands.jsonl"
        home="$PWD/home"
        stderr_file="$PWD/stderr"
        base_path="${
          lib.makeBinPath [
            pkgs.bash
            pkgs.coreutils
            pkgs.gnused
            pkgs.jq
            pkgs.util-linux
          ]
        }"
        mkdir "$stubs" results

        cat > "$stubs/uname" <<'STUB'
        #!${lib.getExe pkgs.bash}
        case "$1" in
          -s) printf '%s\n' "$TEST_HOST" ;;
          -n) printf '%s\n' "$TEST_HOSTNAME" ;;
          -m) printf '%s\n' "$TEST_ARCH" ;;
          -r) printf '%s\n' "$TEST_RELEASE" ;;
          *) exit 1 ;;
        esac
        STUB
        chmod +x "$stubs/uname"
        ${stub "sudo" ""}
        ${stub "nix" ''
          if [ "$1" = build ]; then
            echo "got: sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=" >&2
            exit 1
          fi
        ''}
        ${stub "bun" ''
          case "$*" in
            update\ *) exit "''${TEST_BUN_UPDATE_STATUS:-0}" ;;
            "pm --global cache rm") exit "''${TEST_BUN_CLEANUP_STATUS:-0}" ;;
          esac
        ''}

        prepare_repo() {
          :
          ${prepare}
        }

        run_case() {
          local name="$1" status stdout file=null
          shift
          rm -rf "$repo" "$log" "$home"
          mkdir -p "$repo" "$home"
          touch "$log"
          cp -r ${../.} "$repo/scripts"
          chmod -R u+w "$repo"
          (cd "$repo" && prepare_repo)

          set +e
          stdout="$(cd "$repo" && env -i PATH="$stubs:$base_path" HOME="$home" COMMAND_LOG="$log" "$@" 2>"$stderr_file")"
          status=$?
          set -e

          ${lib.optionalString (inspectFile != null) ''file="$(jq -Rs . "$repo/${inspectFile}")"''}
          jq -n --arg name "$name" --argjson status "$status" --arg stdout "$stdout" \
            --rawfile stderr "$stderr_file" --slurpfile commands "$log" --argjson file "$file" \
            '{($name): {$status, $stdout, $stderr, $commands, $file}}' \
            | sed "s|$repo|@repo@|g" > "results/$name.json"
        }

        ${lib.concatStrings (lib.mapAttrsToList runCase cases)}
        jq -s add results/*.json > "$out"
      '';

  results = builtins.fromJSON (builtins.readFile "${check}");
  failures = lib.filterAttrs (
    name: case: lib.intersectAttrs case.expected results.${name} != case.expected
  ) cases;
in
if failures == { } then
  true
else
  throw "Failing cases: ${builtins.toJSON (lib.mapAttrs (name: _: results.${name}) failures)}"
