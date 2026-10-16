# The Nix builder sets $out for installPhase.
# shellcheck disable=SC2154
runHook preInstall

npm prune --omit=dev --legacy-peer-deps --offline
mkdir -p "$out/lib/pi-packages" "$out/bin"
cp -a package.json package-lock.json node_modules "$out/lib/pi-packages/"
node pi-tools/patch-pi-hidden-assistant-spacing.ts \
  "$out/lib/pi-packages/node_modules/@earendil-works/pi-coding-agent"
node pi-tools/patch-lsp-host-dependencies.ts \
  "$out/lib/pi-packages/node_modules/pi-lsp-adapter"
ln -s "$out/lib/pi-packages/node_modules/.bin/knip" "$out/bin/knip"
ln -s "$out/lib/pi-packages/node_modules/.bin/pi" "$out/bin/pi"

runHook postInstall
