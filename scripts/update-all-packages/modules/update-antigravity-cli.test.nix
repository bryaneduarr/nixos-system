let
  flake = builtins.getFlake ("path:" + toString ../../..);
  pkgs = flake.inputs.nixpkgs.legacyPackages.${builtins.currentSystem};
  inherit (pkgs) lib;

  x86_64Sha512 = lib.strings.replicate 128 "a";
  aarch64Sha512 = lib.strings.replicate 128 "b";

  manifest =
    version: url: sha512:
    builtins.toJSON { inherit version url sha512; };

  runUpdate =
    name: aarch64Manifest:
    pkgs.runCommand "update-antigravity-cli-${name}"
      {
        nativeBuildInputs = [ pkgs.jq ];
        x86_64Manifest = manifest "2.0.0" "https://example.com/x64.tar.gz" x86_64Sha512;
        inherit aarch64Manifest;
      }
      ''
        mkdir -p bin repo/packages/antigravity-cli
        printf 'previous\n' > repo/packages/antigravity-cli/release.json
        cat > bin/curl <<'STUB'
        #!${lib.getExe pkgs.bash}
        case "$2" in
          */linux_amd64.json) printf '%s' "$x86_64Manifest" ;;
          */linux_arm64.json) printf '%s' "$aarch64Manifest" ;;
          *) exit 22 ;;
        esac
        STUB
        chmod +x bin/curl
        export PATH="$PWD/bin:$PATH" x86_64Manifest aarch64Manifest

        if repo_root="$PWD/repo" bash -euo pipefail -c 'source ${./update-antigravity-cli.sh}; _update_antigravity_cli' 2>/dev/null; then
          status=0
        else
          status=$?
        fi
        jq -n --argjson status "$status" --rawfile release repo/packages/antigravity-cli/release.json \
          '{ $status, $release }' > "$out"
      '';

  result = name: aarch64Manifest: lib.importJSON (runUpdate name aarch64Manifest);

  updated = result "updated" (manifest "2.0.0" "https://example.com/arm64.tar.gz" aarch64Sha512);
  mismatchedVersion = result "mismatched-version" (
    manifest "1.9.0" "https://example.com/arm64.tar.gz" aarch64Sha512
  );
  invalidHash = result "invalid-hash" (manifest "2.0.0" "https://example.com/arm64.tar.gz" "invalid");
in
assert updated.status == 0;
assert
  builtins.fromJSON updated.release == {
    version = "2.0.0";
    sources = {
      x86_64-linux = {
        url = "https://example.com/x64.tar.gz";
        sha512 = x86_64Sha512;
      };
      aarch64-linux = {
        url = "https://example.com/arm64.tar.gz";
        sha512 = aarch64Sha512;
      };
    };
  };
assert mismatchedVersion.status != 0 && mismatchedVersion.release == "previous\n";
assert invalidHash.status != 0 && invalidHash.release == "previous\n";
true
