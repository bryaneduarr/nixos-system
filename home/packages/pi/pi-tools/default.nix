{
  lib,
  buildNpmPackage,
  nodejs_24,
}:
let
  packageDefinition = import ./package-definition.nix {
    inherit lib nodejs_24;
  };
in
buildNpmPackage (
  packageDefinition
  // {
    npmDepsHash = "sha256-TRrBFx7qAsKILZmJaRu756X22hlEOk8acafoQNG4DDU=";
    npmDepsFetcherVersion = 2;

    installPhase = builtins.readFile ./install-pinned-npm-packages.sh;
  }
)
