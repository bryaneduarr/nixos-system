_: {
  home.stateVersion = "26.05";

  custom = {
    agent-chrome.enable = true;
    antigravity-cli.enable = true;
    btop.enable = true;

    bun = {
      enable = true;
      extraGlobalPackages = [
        "agent-browser"
        "chrome-devtools-mcp@latest"
      ];
    };

    check-code.enable = true;
    command-line-tools.enable = true;
    development-tools.enable = true;
    engram.enable = true;
    fish.enable = true;
    git.enable = true;
    google-chrome.enable = true;
    herdr.enable = true;
    kitty.enable = true;
    matugen.enable = true;
    neovim.enable = true;
    nix-tools.enable = true;

    onedrive = {
      enable = true;
      # Remote names are case-sensitive and must match the section in rclone.conf.
      remote = "OneDrive";
    };

    pi.enable = true;
    starship.enable = true;
    system-target.enable = true;
    t3code.enable = true;
    tmux.enable = true;
    update-all-packages.enable = true;
    waybar.enable = true;
    worktree-dev.enable = true;

    yazi = {
      enable = true;
      videoPlayer.enable = true;
    };

    zen-browser.enable = true;
    zsh.enable = true;
  };
}
