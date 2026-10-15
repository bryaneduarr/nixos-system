# Asserts the Herdr config in default.nix: Pi notification sounds stay off and
# changing the file reloads running Herdr servers.
let
  flake = builtins.getFlake ("path:" + toString ../../..);
  inherit (flake.inputs.nixpkgs) lib;
  config = flake.nixosConfigurations.nixos.config.home-manager.users.bryaneduarr;
  herdrConfig = config.home.file.".config/herdr/config.toml";
in
assert builtins.elem "pi = \"off\"" (lib.splitString "\n" herdrConfig.text);
assert builtins.match ".*server reload-config.*" herdrConfig.onChange != null;
true
