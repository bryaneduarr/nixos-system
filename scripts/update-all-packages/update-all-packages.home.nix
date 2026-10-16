{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.custom.update-all-packages;
in
{
  options.custom.update-all-packages.enable = lib.mkEnableOption "the nfu command that updates flake inputs and package pins";

  config = lib.mkIf cfg.enable {
    # The script runs from the checkout because it rewrites the working tree's lockfiles.
    home.packages = [
      (pkgs.writeShellApplication {
        name = "nfu";
        text = ''exec bash "$HOME/nixos-system/scripts/update-all-packages/update-all-packages.sh" "$@"'';
      })
    ];
  };
}
