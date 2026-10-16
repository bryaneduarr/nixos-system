{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.custom.system-target;
in
{
  options.custom.system-target.enable = lib.mkEnableOption "the nrs command that rebuilds the target selected for this machine";

  config = lib.mkIf cfg.enable {
    # The script runs from the checkout because it builds the working tree's flake.
    home.packages = [
      (pkgs.writeShellApplication {
        name = "nrs";
        text = ''exec bash "$HOME/nixos-system/scripts/system-target/rebuild.sh" "$@"'';
      })
    ];
  };
}
