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
    npmDepsHash = "sha256-oqEtKmmfEVgEPZt+9gzM+Up35jJuAKxExvUFqoPYfh0=";
    npmDepsFetcherVersion = 2;

    installPhase = builtins.readFile ./install-pinned-npm-packages.sh;
  }
)
