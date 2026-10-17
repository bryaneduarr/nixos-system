{
  bun,
  lib,
  stdenvNoCC,
}:
stdenvNoCC.mkDerivation {
  pname = "rule-audit-dependencies";
  version = "0.1.0";
  src = lib.fileset.toSource {
    root = ./.;
    fileset = lib.fileset.unions [
      ./package.json
      ./bun.lock
    ];
  };
  nativeBuildInputs = [ bun ];
  dontConfigure = true;
  dontFixup = true;

  buildPhase = ''
    runHook preBuild
    export HOME="$TMPDIR"
    export BUN_INSTALL_CACHE_DIR="$TMPDIR/bun-cache"
    bun install --frozen-lockfile --ignore-scripts --no-progress --cpu='*' --os=linux
    runHook postBuild
  '';

  installPhase = ''
    runHook preInstall
    mkdir "$out"
    mv node_modules "$out/node_modules"
    runHook postInstall
  '';

  outputHashMode = "recursive";
  outputHashAlgo = "sha256";
  outputHash = "sha256-k9mBAfoPgJvWny0e23qqjuWFUPOkceb+9GWnfMK/fWs=";
}
