{
  config,
  lib,
  pkgs,
  ...
}:
lib.mkIf config.custom.zsh.enable {
  programs.zsh.initContent = ''
    y() {
      local tmp="$(mktemp -t "yazi-cwd.XXXXXX")" cwd
      yazi "$@" --cwd-file="$tmp"
      IFS= read -r -d "" cwd < "$tmp"
      [ -n "$cwd" ] && [ "$cwd" != "$PWD" ] && builtin cd -- "$cwd"
      rm -f -- "$tmp"
    }

    source ${pkgs.zsh-powerlevel10k}/share/zsh-powerlevel10k/powerlevel10k.zsh-theme
    source ${config.home.homeDirectory}/.p10k.zsh
  '';
}
