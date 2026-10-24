_update_antigravity_cli() {
  # fetchurl accepts the manifest hexadecimal sha512 directly, so no tarball download is needed.
  local -r manifest_base_url="https://antigravity-cli-auto-updater-974169037036.us-central1.run.app/manifests"
  local -r release_file="${repo_root:?repository-context.sh must set repo_root}/packages/antigravity-cli/release.json"
  local x86_64_manifest aarch64_manifest release

  x86_64_manifest="$(curl -fsSL "$manifest_base_url/linux_amd64.json")"
  aarch64_manifest="$(curl -fsSL "$manifest_base_url/linux_arm64.json")"
  release="$(
    jq -n --argjson x86_64 "$x86_64_manifest" --argjson aarch64 "$aarch64_manifest" '
      def source:
        if (.url | type) == "string" and (.sha512 | type == "string" and test("^[0-9a-f]{128}$")) then
          { url, sha512 }
        else
          error("An Antigravity CLI manifest has no valid url and sha512")
        end;

      if ($x86_64.version | type) != "string" or $x86_64.version != $aarch64.version then
        error("The Antigravity CLI manifests do not agree on one version")
      else
        {
          version: $x86_64.version,
          sources: {
            "x86_64-linux": ($x86_64 | source),
            "aarch64-linux": ($aarch64 | source)
          }
        }
      end
    '
  )"

  printf '%s\n' "$release" >"$release_file"
}

update_antigravity_cli() {
  run_with_status \
    "Updating the Antigravity CLI release pin" \
    "Updated the Antigravity CLI release pin" \
    _update_antigravity_cli
}
