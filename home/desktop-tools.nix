{ pkgs, inputs, ... }:
{
  imports = [
    ./desktop
    ./packages/kitty/default.nix
    ./packages/matugen/default.nix
    ./packages/onedrive/default.nix
    ./packages/t3code/default.nix
    ./packages/vscode.nix
    ./packages/waybar/default.nix
    ./packages/zen-browser.nix
    ./packages/zsh/matugen.nix
  ];

  home = {
    pointerCursor = {
      enable = true;
      package = pkgs.bibata-cursors;
      name = "Bibata-Modern-Classic";
      size = 24;
    };

    packages = with pkgs; [
      inputs.awww.packages.${pkgs.stdenv.hostPlatform.system}.default
      bibata-cursors
      bluetui
      google-chrome
      kitty
      matugen
      rofi
      vscode
      wl-clipboard
      wtype
      wev
    ];
  };
}
