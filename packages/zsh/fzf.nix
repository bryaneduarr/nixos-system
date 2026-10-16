{
  config,
  lib,
  ...
}:
lib.mkIf config.custom.zsh.enable {
  programs.zsh.initContent = ''
    zstyle ':fzf-tab:complete:cd:*' fzf-preview 'eza --tree --color=always --level=2 $realpath'

    zstyle ':(fzf-tab:complete:nvim:*|fzf-tab:complete:nano:*|fzf-tab:complete:cat:*|fzf-tab:complete:bat:*|fzf-tab:complete:less:*)' fzf-preview 'bat --color=always --style=numbers,changes --line-range=:500 $realpath'
  '';
}
