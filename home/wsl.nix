_: {
  home.stateVersion = "25.05";

  custom.neovim.enable = true;

  imports = [
    ./terminal-tools.nix
    ./services.nix
  ];

  programs = {
    yazi.shellWrapperName = "yy";
    tmux.extraConfig = ''
      set -s set-clipboard on
    '';
  };
}
