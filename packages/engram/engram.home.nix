{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.custom.engram;
in
{
  options.custom.engram.enable = lib.mkEnableOption "Engram, persistent memory for AI coding agents";

  config = lib.mkIf cfg.enable {
    home.packages = [ (pkgs.callPackage ./engram-package.nix { }) ];
  };
}
