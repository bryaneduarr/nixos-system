{
  config,
  inputs,
  lib,
  osConfig,
  pkgs,
  ...
}:
let
  appearance = import ./appearance-constants.nix;
  desktopFont = "${appearance.fonts.default} ${toString appearance.fonts.size}";
  monospaceFont = "${appearance.fonts.monospace} ${toString appearance.fonts.size}";

  session = osConfig.custom.desktop-session;
in
{
  imports = [
    ./theme-mode/theme-mode.nix
    ./wallpapers/wallpapers.nix
  ];

  config = lib.mkIf session.enable {
    home = {
      sessionVariables.NIXOS_OZONE_WL = "1";

      pointerCursor = {
        enable = true;
        package = pkgs.bibata-cursors;
        name = "Bibata-Modern-Classic";
        size = 24;
      };

      packages = with pkgs; [
        inputs.awww.packages.${pkgs.stdenv.hostPlatform.system}.default
        bibata-cursors
        bluetui
        wl-clipboard
        wtype
        wev
      ];
    };

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

    xdg.configFile."${session.compositor}-mimeapps.list".text = lib.generators.toINI { } {
      "Default Applications" = lib.mapAttrs (
        _: applications: lib.concatStringsSep ";" applications
      ) config.xdg.mimeApps.defaultApplications;
    };
  };
}
