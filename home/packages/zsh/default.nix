{ pkgs, ... }:
{
  imports = [
    ./history.nix
    ./aliases.nix
    ./plugins.nix
    ./environment.nix
    ./functions.nix
    ./fzf.nix
  ];

  programs.zsh.enable = true;

  home.packages = [ pkgs.zsh-powerlevel10k ];

  home.file.".p10k.zsh".source = ./../../.p10k.zsh;

}
