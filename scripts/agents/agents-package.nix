{
  bun,
  callPackage,
  lib,
  makeWrapper,
  stdenvNoCC,
}:
let
  dependencies = callPackage ./agents-dependencies.nix { };
in
stdenvNoCC.mkDerivation {
  pname = "agents";
  version = "0.1.0";
  src = lib.fileset.toSource {
    root = ./.;
    fileset = lib.fileset.difference (lib.fileset.fileFilter (file: file.hasExt "ts") ./.) (
      lib.fileset.unions [
        (lib.fileset.fileFilter (file: lib.hasSuffix ".test.ts" file.name) ./.)
        (lib.fileset.fileFilter (file: lib.hasSuffix ".test-double.ts" file.name) ./.)
        (lib.fileset.maybeMissing ./node_modules)
      ]
    );
  };
  nativeBuildInputs = [ makeWrapper ];
  dontConfigure = true;
  dontBuild = true;

  installPhase = ''
    runHook preInstall
    mkdir -p "$out/lib/agents" "$out/bin"
    cp -r . "$out/lib/agents"
    ln -s ${dependencies}/node_modules "$out/lib/agents/node_modules"
    makeWrapper ${lib.getExe bun} "$out/bin/agents" --add-flags "$out/lib/agents/agents.ts"
    runHook postInstall
  '';

  meta.mainProgram = "agents";
}
