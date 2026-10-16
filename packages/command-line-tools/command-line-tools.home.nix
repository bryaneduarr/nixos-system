{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.custom.command-line-tools;
in
{
  options.custom.command-line-tools.enable = lib.mkEnableOption "everyday command-line utilities";

  config = lib.mkIf cfg.enable {
    home.packages = with pkgs; [
      bat
      curl
      eza
      fastfetch
      fd
      ffmpeg
      fzf
      jq
      killall
      ripgrep
      tailscale
      tree
      unzip
      wget
      yq-go
    ];
  };
}
