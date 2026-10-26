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
    npmDepsHash = "sha256-MHDTY4/bNA5wCnzEnN/wIUt9gIV9YE6kbEaB4/kIcxk=";
    npmDepsFetcherVersion = 2;

    installPhase = builtins.readFile ./install-pinned-npm-packages.sh;
  }
)
