_: {
  programs.zsh.zplug = {
    enable = true;
    plugins = [
      { name = "zsh-users/zsh-syntax-highlighting"; }
      { name = "jeffreytse/zsh-vi-mode"; }
      {
        name = "romkatv/powerlevel10k";
        tags = [
          "as:theme"
          "depth:1"
        ];
      }
      { name = "zsh-users/zsh-completions"; }
      { name = "zsh-users/zsh-autosuggestions"; }
      { name = "Aloxaf/fzf-tab"; }
    ];
  };
}
