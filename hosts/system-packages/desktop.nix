{
  config,
  lib,
  pkgs,
  ...
}:
{
  imports = [
    ./hyprland.nix
    ./niri.nix
  ];

  options.desktop.compositor = lib.mkOption {
    type = lib.types.enum [
      "hyprland"
      "niri"
    ];
    description = "Wayland compositor enabled for the system and Home Manager.";
  };

  config = {
    assertions = [
      {
        assertion =
          config.programs.hyprland.enable == (config.desktop.compositor == "hyprland")
          && config.programs.niri.enable == (config.desktop.compositor == "niri");
        message = "Enable only the compositor selected by desktop.compositor.";
      }
    ];

    xdg.portal = {
      extraPortals = [ pkgs.xdg-desktop-portal-gtk ];
      xdgOpenUsePortal = true;
    };
  };
}
