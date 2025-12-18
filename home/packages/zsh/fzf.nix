_: {
  programs.zsh.initContent = ''
    # Preview directories for cd with eza tree and colors.
    zstyle ':fzf-tab:complete:cd:*' fzf-preview 'eza --tree --color=always --level=2 $realpath'

    # Preview files for a list of commands using bat.
    zstyle ':(fzf-tab:complete:nvim:*|fzf-tab:complete:nano:*|fzf-tab:complete:cat:*|fzf-tab:complete:bat:*|fzf-tab:complete:less:*)' fzf-preview 'bat --color=always --style=numbers,changes --line-range=:500 $realpath'
  '';
}
