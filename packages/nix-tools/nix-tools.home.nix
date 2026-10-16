{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.custom.nix-tools;
in
{
  options.custom.nix-tools.enable = lib.mkEnableOption "the Nix language server, formatter, and linters";

  config = lib.mkIf cfg.enable {
    home.packages = with pkgs; [
      deadnix
      nil
      nixfmt
      statix
    ];
  };
}
