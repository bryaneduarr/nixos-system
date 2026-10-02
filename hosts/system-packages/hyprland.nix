{ pkgs, ... }:
{
  programs.hyprland = {
    enable = true;
    xwayland.enable = true;
  };

  xdg.portal = {
    extraPortals = [ pkgs.xdg-desktop-portal-gtk ];
    xdgOpenUsePortal = true;

    config.hyprland = {
      default = [
        "hyprland"
        "gtk"
      ];
      "org.freedesktop.impl.portal.AppChooser" = [ "gtk" ];
      "org.freedesktop.impl.portal.FileChooser" = [ "gtk" ];
    };
  };
}
