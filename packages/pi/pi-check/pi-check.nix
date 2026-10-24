{
  biome,
  bun,
  callPackage,
  fd,
  lib,
  nodejs_24,
  ripgrep,
  stdenvNoCC,
  typescript,
}:
let
  ruleAudit = callPackage ../../../scripts/rule-audit/rule-audit-package.nix { };

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
      # Transcript color tests expect the truecolor terminal Pi runs in.
      export COLORTERM=truecolor
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
    outputHash = "sha256-4cajK71Nu/0RyI3iLztujef6ro4pJlVwqFaRVDzxpuY=";
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
    fd
    nodejs_24
    ripgrep
    ruleAudit
    typescript
  ];
  dontConfigure = true;

  buildPhase = ''
    runHook preBuild
    export HOME="$TMPDIR"
    # Transcript color tests expect the truecolor terminal Pi runs in.
    export COLORTERM=truecolor
    ln -s ${dependencies}/node_modules node_modules
    # Mirrors the package.json check script; the sandbox has no /usr/bin/env for knip's shebang.
    tsc --noEmit
    biome ci .
    node node_modules/.bin/knip
    bun test
    rule-audit . ${../../../.agents/rules/pi-rule-audit.md}
    runHook postBuild
  '';

  installPhase = ''
    runHook preInstall
    touch "$out"
    runHook postInstall
  '';
}
