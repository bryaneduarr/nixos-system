{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.custom.desktop-session;
in
{
  imports = [
    ./fonts.nix
    ./keyboard-remap.nix
  ];

  options.custom.desktop-session = {
    enable = lib.mkEnableOption "the graphical Wayland desktop session";

    compositor = lib.mkOption {
      type = lib.types.enum [
        "hyprland"
        "niri"
      ];
      description = "Wayland compositor enabled for the system and Home Manager.";
    };
  };

  config = lib.mkIf cfg.enable {
    assertions = [
      {
        assertion =
          config.programs.hyprland.enable == (cfg.compositor == "hyprland")
          && config.programs.niri.enable == (cfg.compositor == "niri");
        message = "Enable only the compositor selected by custom.desktop-session.compositor.";
      }
    ];

    hardware.bluetooth.enable = true;

    networking.networkmanager.enable = true;

    services = {
      displayManager.ly = {
        enable = true;

        settings = {
          animation = "matrix";
          hide_borders = true;
        };
      };

      libinput.enable = true;

      pipewire = {
        enable = true;
        pulse.enable = true;
      };
    };

    xdg.portal = {
      extraPortals = [ pkgs.xdg-desktop-portal-gtk ];
      xdgOpenUsePortal = true;
    };
  };
}
