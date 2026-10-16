{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.custom.playwright;
in
{
  options.custom.playwright.enable = lib.mkEnableOption "nix-ld libraries for the Chromium and Firefox builds that Playwright downloads";

  config = lib.mkIf cfg.enable {
    programs.nix-ld = {
      enable = true;
      libraries = with pkgs; [
        alsa-lib
        at-spi2-core
        cairo
        cups
        dbus
        expat
        fontconfig
        freetype
        gdk-pixbuf
        glib
        gtk3
        libdrm
        libgbm
        libx11
        libxcb
        libxcomposite
        libxcursor
        libxdamage
        libxext
        libxfixes
        libxi
        libxkbcommon
        libxrandr
        libxrender
        nspr
        nss
        pango
      ];
    };

    # Playwright's host check looks for Debian or Ubuntu packages and rejects NixOS.
    environment.sessionVariables.PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = "1";
  };
}
