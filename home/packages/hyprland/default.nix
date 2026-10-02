{
  config,
  lib,
  pkgs,
  ...
}:
{
  xdg.configFile."hyprland-mimeapps.list".text = lib.generators.toINI { } {
    "Default Applications" = lib.mapAttrs (
      _: applications: lib.concatStringsSep ";" applications
    ) config.xdg.mimeApps.defaultApplications;
  };

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

  home = {
    sessionVariables = {
      NIXOS_OZONE_WL = "1"; # Hint Electron apps to use Wayland.
    };

    file = {
      ".config/hypr/scripts/right-alt-trigger.sh" = {
        source = ./scripts/right-alt-trigger.sh;
        executable = true;
      };
    };
  };
}
