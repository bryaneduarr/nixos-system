{ config, pkgs, ... }:
{
  programs.zsh.initContent = ''
    # Function to update and rebuild the system using flakes
    nrs() {
      sudo nixos-rebuild switch --flake ~/nixos-system/#nixos "$@"
    }

    # Function that comes from the scripts/ folder to update all the system
    nfu() {
      ${config.home.homeDirectory}/nixos-system/scripts/update-all-packages/update-all-packages.sh "$@"
    }

    # Yazi function to stay in the directory and activate with 'y'
    y() {
      local tmp="$(mktemp -t "yazi-cwd.XXXXXX")" cwd
      yazi "$@" --cwd-file="$tmp"
      IFS= read -r -d "" cwd < "$tmp"
      [ -n "$cwd" ] && [ "$cwd" != "$PWD" ] && builtin cd -- "$cwd"
      rm -f -- "$tmp"
    }

    # Source Powerlevel10k theme and configuration
    source ${pkgs.zsh-powerlevel10k}/share/zsh-powerlevel10k/powerlevel10k.zsh-theme
    source ${config.home.homeDirectory}/.p10k.zsh
  '';
}
