# Central point file for the home-manager for the user.
{ ... }:
{
  home.stateVersion = "25.05";

  imports = [
    # Here is where we will install nix packages.
    ./packages.nix

    # Packages installed configuration will be placed here.
    ./packages/btop.nix
    ./packages/git.nix
    ./packages/hyprland/default.nix
    ./packages/kitty/default.nix
    ./packages/matugen/default.nix
    ./packages/nvim.nix
    ./packages/tmux.nix
    ./packages/vscode.nix
    ./packages/waybar/default.nix
    ./packages/yazi.nix
    ./packages/zen-browser.nix
    ./packages/zsh/default.nix
  ];
}
