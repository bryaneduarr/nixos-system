{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.custom.desktop-session;
in
lib.mkIf (cfg.enable && cfg.compositor == "niri") {
  programs.niri = {
    enable = true;
    useNautilus = false;
  };

  environment.systemPackages = with pkgs; [
    brightnessctl
    orca
    playerctl
    swaylock
    wireplumber
    xwayland-satellite
  ];

  services = {
    gnome.at-spi2-core.enable = true;
    udev.packages = [ pkgs.brightnessctl ];
  };

  xdg.portal.config.niri."org.freedesktop.impl.portal.AppChooser" = [ "gtk" ];
}
