_update_pi_dependencies() {
  run_quietly bun add \
    --cwd "$repo_root/packages/pi" \
    --lockfile-only \
    --ignore-scripts \
    --exact \
    '@earendil-works/pi-coding-agent@latest' \
    '@earendil-works/pi-agent-core@latest' \
    '@earendil-works/pi-ai@latest' \
    '@earendil-works/pi-client@latest' \
    '@earendil-works/pi-protocol@latest' \
    '@earendil-works/pi-telemetry@latest' \
    '@earendil-works/pi-tui@latest' \
    '@ff-labs/pi-fff@latest' \
    'pi-lsp-adapter@latest' \
    '@juvio15/pi-ast-grep@latest' \
    'pi-tree-sitter@latest' \
    'pi-mcp-adapter@latest' \
    'pi-powerline-footer@latest' \
    'pi-web-access@latest' \
    'knip@latest'

  # Nix's reproducible node dependency builder currently consumes package-lock.json.
  # Bun updates package.json/bun.lock; npm mirrors that resolution into the
  # lockfile required by buildNpmPackage.
  run_quietly npm --prefix "$repo_root/packages/pi" install \
    --package-lock-only \
    --legacy-peer-deps \
    --ignore-scripts \
    --save-exact

  normalize_pi_npm_lock_integrity "$repo_root/packages/pi/package-lock.json"
}

update_pi_dependencies() {
  run_with_status \
    "Updating Pi packages and lockfiles" \
    "Updated Pi packages and lockfiles" \
    _update_pi_dependencies
}
