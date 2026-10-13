_: {
  home.stateVersion = "25.05";

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
