update_pi_dependencies() {
  echo "  -> Updating Pi packages and lockfile..."
  run_quietly bun add \
    --cwd "$repo_root/home/packages/pi" \
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
    'pi-subagents@latest' \
    'knip@latest'

  # Nix's reproducible node dependency builder currently consumes package-lock.json.
  # Bun updates package.json/bun.lock; npm mirrors that resolution into the
  # lockfile required by buildNpmPackage.
  run_quietly npm --prefix "$repo_root/home/packages/pi" install \
    --package-lock-only \
    --legacy-peer-deps \
    --ignore-scripts \
    --save-exact
}
