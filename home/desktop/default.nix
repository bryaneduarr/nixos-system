{
  config,
  lib,
  osConfig,
  ...
}:
let
  appearance = import ./appearance-constants.nix;
  desktopFont = "${appearance.fonts.default} ${toString appearance.fonts.size}";
  monospaceFont = "${appearance.fonts.monospace} ${toString appearance.fonts.size}";

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
    ./theme-mode
  ];

  home.sessionVariables.NIXOS_OZONE_WL = "1";

  gtk = {
    enable = true;
    font = {
      name = appearance.fonts.default;
      size = appearance.fonts.size;
    };
  };

  dconf.settings = {
    "org/gnome/desktop/interface" = {
      document-font-name = desktopFont;
      monospace-font-name = monospaceFont;
    };

    "org/gnome/desktop/wm/preferences".titlebar-font =
      "${appearance.fonts.default} Bold ${toString appearance.fonts.size}";
  };

  qt = {
    enable = true;
    platformTheme.name = "gtk3";
  };

  programs.rofi = {
    enable = true;
    settings.font = desktopFont;
  };

  xdg.configFile."${compositor}-mimeapps.list".text = lib.generators.toINI { } {
    "Default Applications" = lib.mapAttrs (
      _: applications: lib.concatStringsSep ";" applications
    ) config.xdg.mimeApps.defaultApplications;
  };
}
