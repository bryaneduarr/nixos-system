{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.custom.agents;
  agents = pkgs.callPackage ./agents-package.nix { };
in
{
  options.custom.agents.enable = lib.mkEnableOption "the agents command that shows coding-agent subscription usage";

  config = lib.mkIf cfg.enable {
    home.packages = [ agents ];
  };
}
