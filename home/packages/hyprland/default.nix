_: {
  wayland.windowManager.hyprland = {
    enable = true;

    settings = {
      monitor = "DP-3,1920x1080@280,0x0,1.25";

      # Autostart programs
      exec-once = [
        "waybar"
        "awww-daemon"
      ];

      windowrule = [
        "opacity 0.85 override 0.95 override, match:class ^(kitty)$"
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

  home.file.".config/hypr/scripts/right-alt-trigger.sh" = {
    source = ./scripts/right-alt-trigger.sh;
    executable = true;
  };

  systemd.user.services.awww-daemon = {
    Unit = {
      Description = "awww wallpaper daemon";
      After = [ "graphical-session.target" ];
      PartOf = [ "graphical-session.target" ];
    };
    Service = {
      ExecStart = "${inputs.awww.packages.${pkgs.stdenv.hostPlatform.system}.default}/bin/awww-daemon";
      Restart = "on-failure";
    };
    Install = {
      WantedBy = [ "graphical-session.target" ];
    };
  };
}
