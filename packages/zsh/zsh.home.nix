{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.custom.zsh;
in
{
  imports = [
    ./history.nix
    ./aliases.nix
    ./plugins.nix
    ./environment.nix
    ./functions.nix
    ./fzf.nix
    ./matugen.nix
  ];

  options.custom.zsh.enable = lib.mkEnableOption "zsh with Powerlevel10k, zplug plugins, and shell functions";

  config = lib.mkIf cfg.enable {
    programs.zsh.enable = true;

    home = {
      packages = [ pkgs.zsh-powerlevel10k ];
      file.".p10k.zsh".source = ./.p10k.zsh;
    };
  };
}
