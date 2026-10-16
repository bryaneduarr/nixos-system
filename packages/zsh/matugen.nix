{
  config,
  lib,
  ...
}:
lib.mkIf (config.custom.zsh.enable && config.custom.matugen.enable) {
  # Matugen writes its zsh colors into this directory, so it must exist.
  xdg.configFile."zsh/.keep".text = "";

  programs.zsh.initContent = lib.mkAfter ''
    [[ -f ~/.config/zsh/matugen-colors.zsh ]] && source ~/.config/zsh/matugen-colors.zsh
  '';
}
