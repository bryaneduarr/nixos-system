{
  pkgs,
  ...
}:
{
  wayland.windowManager.hyprland = {
    enable = true;
    configType = "hyprlang";

    settings = {
      animations.enabled = true;

      monitor = "DP-3,1920x1080@280,0x0,1";

      windowrule = [ ];

      exec-once = [
        "hyprctl setcursor Bibata-Modern-Classic 24"
        "systemctl --user import-environment WAYLAND_DISPLAY"
        "bash $HOME/.config/wallpapers/awww-matugen-init.sh"
      ];
    }
    // import ./animations.nix
    // import ./decoration.nix
    // import ./general.nix
    // import ./cursor.nix
    // import ./input.nix
    // import ./keybindings.nix { inherit pkgs; }
    // import ./miscellaneous.nix;
  };

  home.file.".config/hypr/scripts/right-alt-trigger.sh" = {
    source = ./scripts/right-alt-trigger.sh;
    executable = true;
  };
}
