{
  biome,
  bun,
  lib,
  nodejs_24,
  stdenvNoCC,
  typescript,
}:
let
  dependencies = stdenvNoCC.mkDerivation {
    pname = "pi-check-dependencies";
    version = "0.1.0";
    src = lib.fileset.toSource {
      root = ../.;
      fileset = lib.fileset.unions [
        ../package.json
        ../bun.lock
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
    # Installing packages for every CPU keeps this hash identical on x86_64 and aarch64.
    outputHash = "sha256-bx4yLtVF028tezx2NQm/Hs6pZ5Xhjn1JUwimYFcZRZ8=";
  };
in
stdenvNoCC.mkDerivation {
  name = "pi-check";
  src = lib.fileset.toSource {
    root = ../.;
    fileset = lib.fileset.unions [
      ../agent-configuration
      ../pi-tools
      ../package.json
      ../bun.lock
      ../tsconfig.json
      ../biome.json
      ../knip.json
    ];
  };
  nativeBuildInputs = [
    biome
    bun
    nodejs_24
    typescript
  ];
  dontConfigure = true;

  buildPhase = ''
    runHook preBuild
    export HOME="$TMPDIR"
    ln -s ${dependencies}/node_modules node_modules
    # Mirrors the package.json check script; the sandbox has no /usr/bin/env for knip's shebang.
    tsc --noEmit
    biome ci .
    node node_modules/.bin/knip
    bun test
    runHook postBuild
  '';

  installPhase = ''
    runHook preInstall
    touch "$out"
    runHook postInstall
  '';
}
