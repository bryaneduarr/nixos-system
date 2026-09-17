runHook preInstall

mkdir -p "$out/lib/pi-packages" "$out/bin"
cp -a package.json package-lock.json node_modules "$out/lib/pi-packages/"
ln -s "$out/lib/pi-packages/node_modules/.bin/knip" "$out/bin/knip"
ln -s "$out/lib/pi-packages/node_modules/.bin/pi" "$out/bin/pi"

runHook postInstall
