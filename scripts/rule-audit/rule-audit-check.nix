{
  biome,
  bun,
  callPackage,
  lib,
  stdenvNoCC,
  typescript,
}:
let
  dependencies = callPackage ./rule-audit-dependencies.nix { };
in
stdenvNoCC.mkDerivation {
  name = "rule-audit-check";
  src = lib.fileset.toSource {
    root = ./.;
    fileset = lib.fileset.difference ./. (lib.fileset.maybeMissing ./node_modules);
  };
  nativeBuildInputs = [
    biome
    bun
    typescript
  ];
  dontConfigure = true;

  buildPhase = ''
    runHook preBuild
    export HOME="$TMPDIR"
    ln -s ${dependencies}/node_modules node_modules
    tsc --noEmit
    biome ci .
    bun test
    bun rule-audit.ts .
    runHook postBuild
  '';

  installPhase = ''
    runHook preInstall
    touch "$out"
    runHook postInstall
  '';
}
