# The Nix builder sets $out for installPhase.
# shellcheck disable=SC2154
runHook preInstall

npm prune --omit=dev --legacy-peer-deps --offline
mkdir -p "$out/lib/pi-packages" "$out/bin"
cp -a package.json package-lock.json node_modules "$out/lib/pi-packages/"
node pi-tools/patches/pi-coding-agent/transcript-rendering/pi-hidden-assistant-spacing.patch.ts \
  "$out/lib/pi-packages/node_modules/@earendil-works/pi-coding-agent"
node pi-tools/patches/pi-coding-agent/turn-navigation/pi-turn-window.patch.ts \
  "$out/lib/pi-packages/node_modules/@earendil-works/pi-coding-agent"
node pi-tools/patches/pi-coding-agent/transcript-rendering/pi-api-error-renderer.patch.ts \
  "$out/lib/pi-packages/node_modules/@earendil-works/pi-coding-agent"
node pi-tools/patches/pi-coding-agent/transcript-rendering/pi-warning-box.patch.ts \
  "$out/lib/pi-packages/node_modules/@earendil-works/pi-coding-agent"
node pi-tools/patches/pi-coding-agent/transcript-rendering/pi-thinking-visibility.patch.ts \
  "$out/lib/pi-packages/node_modules/@earendil-works/pi-coding-agent"
node pi-tools/patches/pi-coding-agent/transcript-rendering/pi-thinking-box.patch.ts \
  "$out/lib/pi-packages/node_modules/@earendil-works/pi-coding-agent"
node pi-tools/patches/pi-coding-agent/turn-navigation/pi-jump-to-latest-indicator.patch.ts \
  "$out/lib/pi-packages/node_modules/@earendil-works/pi-coding-agent"
node pi-tools/patches/pi-coding-agent/turn-navigation/pi-scroll-on-submit.patch.ts \
  "$out/lib/pi-packages/node_modules/@earendil-works/pi-coding-agent"
node pi-tools/patches/pi-coding-agent/transcript-rendering/pi-message-cards.patch.ts \
  "$out/lib/pi-packages/node_modules/@earendil-works/pi-coding-agent"
node pi-tools/patches/pi-extension-packages/pi-tree-sitter-grammars.patch.ts \
  "$out/lib/pi-packages/node_modules/pi-tree-sitter"
node pi-tools/patches/pi-extension-packages/lsp-host-dependencies.patch.ts \
  "$out/lib/pi-packages/node_modules/pi-lsp-adapter"
node pi-tools/patches/pi-extension-packages/powerline-empty-context.patch.ts \
  "$out/lib/pi-packages/node_modules/pi-powerline-footer"
node pi-tools/patches/pi-extension-packages/powerline-input-card.patch.ts \
  "$out/lib/pi-packages/node_modules/pi-powerline-footer"
ln -s "$out/lib/pi-packages/node_modules/.bin/knip" "$out/bin/knip"
ln -s "$out/lib/pi-packages/node_modules/.bin/pi" "$out/bin/pi"

runHook postInstall
