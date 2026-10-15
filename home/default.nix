_: {
  home.stateVersion = "26.05";

  custom.neovim.enable = true;

  imports = [
    ./terminal-tools.nix
    ./desktop-tools.nix
    ./services.nix
  ];
}
