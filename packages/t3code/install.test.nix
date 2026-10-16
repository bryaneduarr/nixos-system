let
  flake = builtins.getFlake ("path:" + toString ../..);
  pkgs = flake.inputs.nixpkgs.legacyPackages.${builtins.currentSystem};
  module = import ./t3code.home.nix {
    inherit pkgs;
    inherit (pkgs) lib;
    config = {
      custom.t3code.enable = true;
      home.homeDirectory = "/homeless-shelter";
    };
  };
  installer = builtins.head module.config.content.home.packages;
  check = pkgs.runCommand "t3code-install-test" {
    nativeBuildInputs = [ pkgs.jq ];
    installer = pkgs.lib.getExe installer;
  } (builtins.readFile ./install-test-harness.sh + builtins.readFile ./install.test.sh);
in
assert installer.name == "t3code-install";
assert builtins.readFile "${check}" == "passed\n";
true
