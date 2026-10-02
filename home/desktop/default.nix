{
  config,
  lib,
  osConfig,
  ...
}:
let
  compositor = osConfig.desktop.compositor;
  compositorModules = {
    hyprland = ../packages/hyprland;
    niri = ../packages/niri;
  };
in
{
  imports = [
    compositorModules.${compositor}
    ./wallpapers
  ];

  home.sessionVariables.NIXOS_OZONE_WL = "1";

  xdg.configFile."${compositor}-mimeapps.list".text = lib.generators.toINI { } {
    "Default Applications" = lib.mapAttrs (
      _: applications: lib.concatStringsSep ";" applications
    ) config.xdg.mimeApps.defaultApplications;
  };
}
