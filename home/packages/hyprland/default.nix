_: {
  wayland.windowManager.hyprland = {
    enable = true;

    settings = {
      monitor = "DP-3,1920x1080@280,0x0,1";

      # Autostart programs
      exec-once = [
        "waybar"
        "awww-daemon"
      ];

      windowrulev2 = [
        "opacity 0.85 override 0.95 override,class:^(kitty)$"
      ];
    }
    // import ./animations.nix
    // import ./decoration.nix
    // import ./general.nix
    // import ./input.nix
    // import ./keybindings.nix
    // import ./miscellaneous.nix;
  };

  home.sessionVariables = {
    NIXOS_OZONE_WL = "1"; # Hint Electron apps to use Wayland.
  };

  home.file.".config/hypr/scripts/awww-wallpaper-switch.sh" = {
    source = ./scripts/awww-wallpaper-switch.sh;
    executable = true;
  };
}
