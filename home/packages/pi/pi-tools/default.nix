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
    npmDepsHash = "sha256-HY52mJ/BAE5EZmZXZlxNK/Qi62GRYAcZizejb4ji3+o=";
    npmDepsFetcherVersion = 2;

    installPhase = builtins.readFile ./install-pinned-npm-packages.sh;
  }
)
