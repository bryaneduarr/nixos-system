{
  lib,
  buildNpmPackage,
  nodejs_latest,
}:
let
  packageDefinition = import ./package-definition.nix {
    inherit lib nodejs_latest;
  };
in
buildNpmPackage (
  packageDefinition
  // {
    npmDepsHash = "sha256-2sfTau1YzDfSPHN7e1aP2iBaXQips+KhuevNdP3U0Kk=";
    npmDepsFetcherVersion = 2;

    installPhase = builtins.readFile ./install-pinned-npm-packages.sh;
  }
)
