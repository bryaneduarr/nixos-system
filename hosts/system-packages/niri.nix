{
  config,
  lib,
  pkgs,
  ...
}:
lib.mkIf (config.desktop.compositor == "niri") {
  programs.niri = {
    enable = true;
    useNautilus = false;
  };

  environment.systemPackages = [ pkgs.xwayland-satellite ];

  xdg.portal.config.niri."org.freedesktop.impl.portal.AppChooser" = [ "gtk" ];
}
