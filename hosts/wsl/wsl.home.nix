_: {
  home.stateVersion = "25.05";

  custom = {
    btop.enable = true;

    bun = {
      enable = true;
    };

    command-line-tools.enable = true;
    development-tools.enable = true;
    engram.enable = true;
    fish.enable = true;
    git.enable = true;
    herdr.enable = true;
    neovim.enable = true;
    nix-tools.enable = true;
    pi.enable = true;
    starship.enable = true;
    system-target.enable = true;

    tmux = {
      enable = true;
      systemClipboard.enable = true;
    };

    update-all-packages.enable = true;
    worktree-dev.enable = true;

    yazi = {
      enable = true;
      shellWrapperName = "yy";
    };

    zsh.enable = true;
  };
}
