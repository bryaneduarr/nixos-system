{
  bun,
  callPackage,
  lib,
  makeWrapper,
  stdenvNoCC,
}:
let
  dependencies = callPackage ./rule-audit-dependencies.nix { };
in
stdenvNoCC.mkDerivation {
  pname = "rule-audit";
  version = "0.1.0";
  src = lib.fileset.toSource {
    root = ./.;
    fileset = lib.fileset.difference (lib.fileset.fileFilter (file: file.hasExt "ts") ./.) (
      lib.fileset.unions [
        (lib.fileset.fileFilter (file: lib.hasSuffix ".test.ts" file.name) ./.)
        (lib.fileset.maybeMissing ./node_modules)
      ]
    );
  };
  nativeBuildInputs = [ makeWrapper ];
  dontConfigure = true;
  dontBuild = true;

  installPhase = ''
    runHook preInstall
    mkdir -p "$out/lib/rule-audit" "$out/bin"
    cp -r . "$out/lib/rule-audit"
    ln -s ${dependencies}/node_modules "$out/lib/rule-audit/node_modules"
    makeWrapper ${lib.getExe bun} "$out/bin/rule-audit" --add-flags "$out/lib/rule-audit/rule-audit.ts"
    runHook postInstall
  '';

  meta.mainProgram = "rule-audit";
}
