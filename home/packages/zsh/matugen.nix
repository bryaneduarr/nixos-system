_: {
  programs.zsh.initContent = ''
    # Load matugen colors for syntax highlighting.
    [[ -f ~/.config/zsh/matugen-colors.zsh ]] && source ~/.config/zsh/matugen-colors.zsh
  '';
}
