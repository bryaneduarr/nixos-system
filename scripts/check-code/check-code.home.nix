{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.custom.check-code;
  checkCode = pkgs.callPackage ./check-code-package.nix { };
in
{
  options.custom.check-code.enable = lib.mkEnableOption "the check-code command that runs every language's command-line diagnostics";

  config = lib.mkIf cfg.enable {
    home.packages = [ checkCode ];
  };
}
