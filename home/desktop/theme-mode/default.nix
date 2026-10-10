{ pkgs, ... }:
let
  schemaDirectory = "${pkgs.gsettings-desktop-schemas}/share/gsettings-schemas/${pkgs.gsettings-desktop-schemas.name}/glib-2.0/schemas";

  themeCommand = pkgs.writeShellApplication {
    name = "desktop-theme";

    runtimeInputs = [
      pkgs.coreutils
      pkgs.glib
      pkgs.kitty
      pkgs.matugen
      pkgs.procps
      pkgs.util-linux
    ];

    runtimeEnv.GSETTINGS_SCHEMA_DIR = schemaDirectory;

    text = builtins.readFile ./desktop-theme.sh;
  };
in
{
  dconf.enable = true;

  home.packages = [
    themeCommand
    pkgs.gnome-themes-extra
  ];
}
