{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.custom.google-chrome;
in
{
  options.custom.google-chrome.enable = lib.mkEnableOption "the Google Chrome browser";

  config = lib.mkIf cfg.enable {
    home.packages = [ pkgs.google-chrome ];
  };
}
