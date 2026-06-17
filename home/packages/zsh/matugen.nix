_: {
  # Ensure ~/.config/zsh exists so matugen can write its output there
  xdg.configFile."zsh/.keep".text = "";

  programs.zsh.initContent = ''
    # Load matugen colors for syntax highlighting.
    [[ -f ~/.config/zsh/matugen-colors.zsh ]] && source ~/.config/zsh/matugen-colors.zsh
  '';
}
