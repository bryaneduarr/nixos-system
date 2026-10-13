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
    npmDepsHash = "sha256-aZFGaoVnrjWqgoEaowqr4IyZLYVvE2w1GjKyTMuy+1U=";
    npmDepsFetcherVersion = 2;

    installPhase = builtins.readFile ./install-pinned-npm-packages.sh;
  }
)
