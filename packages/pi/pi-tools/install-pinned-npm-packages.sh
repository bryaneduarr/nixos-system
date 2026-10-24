# The Nix builder sets $out for installPhase.
# shellcheck disable=SC2154
runHook preInstall

npm prune --omit=dev --legacy-peer-deps --offline
mkdir -p "$out/lib/pi-packages" "$out/bin"
cp -a package.json package-lock.json node_modules "$out/lib/pi-packages/"
node pi-tools/patch-pi-hidden-assistant-spacing.ts \
  "$out/lib/pi-packages/node_modules/@earendil-works/pi-coding-agent"
node pi-tools/patch-pi-turn-window.ts \
  "$out/lib/pi-packages/node_modules/@earendil-works/pi-coding-agent"
node pi-tools/patch-pi-api-error-renderer.ts \
  "$out/lib/pi-packages/node_modules/@earendil-works/pi-coding-agent"
node pi-tools/patch-pi-warning-box.ts \
  "$out/lib/pi-packages/node_modules/@earendil-works/pi-coding-agent"
node pi-tools/patch-pi-thinking-visibility.ts \
  "$out/lib/pi-packages/node_modules/@earendil-works/pi-coding-agent"
node pi-tools/patch-pi-thinking-box.ts \
  "$out/lib/pi-packages/node_modules/@earendil-works/pi-coding-agent"
node pi-tools/patch-pi-jump-to-latest-indicator.ts \
  "$out/lib/pi-packages/node_modules/@earendil-works/pi-coding-agent"
node pi-tools/patch-pi-scroll-on-submit.ts \
  "$out/lib/pi-packages/node_modules/@earendil-works/pi-coding-agent"
node pi-tools/patch-pi-message-cards.ts \
  "$out/lib/pi-packages/node_modules/@earendil-works/pi-coding-agent"
node pi-tools/patch-pi-tree-sitter-grammars.ts \
  "$out/lib/pi-packages/node_modules/pi-tree-sitter"
node pi-tools/patch-lsp-host-dependencies.ts \
  "$out/lib/pi-packages/node_modules/pi-lsp-adapter"
node pi-tools/patch-powerline-empty-context.ts \
  "$out/lib/pi-packages/node_modules/pi-powerline-footer"
node pi-tools/patch-powerline-input-card.ts \
  "$out/lib/pi-packages/node_modules/pi-powerline-footer"
ln -s "$out/lib/pi-packages/node_modules/.bin/knip" "$out/bin/knip"
ln -s "$out/lib/pi-packages/node_modules/.bin/pi" "$out/bin/pi"

runHook postInstall
