{
  inputs,
  lib,
  ...
}:
let
  browserDesktopEntry = "zen-twilight.desktop";
  browserMimeTypes = [
    "text/html"
    "application/xhtml+xml"
    "x-scheme-handler/http"
    "x-scheme-handler/https"
  ];
  browserAssociations = lib.genAttrs browserMimeTypes (_: browserDesktopEntry);
in
{
  imports = [
    inputs.zen-browser.homeModules.twilight
  ];

  programs.zen-browser = {
    enable = true;

    policies = {
      DisableAppUpdate = true;
      DisableTelemetry = true;
      DisablePocket = true;
      DontCheckDefaultBrowser = true;
      OfferToSaveLogins = false;

      Preferences = {
        "widget.use-xdg-desktop-portal.open-uri" = {
          Value = 1;
          Status = "default";
        };

        "widget.use-xdg-desktop-portal.mime-handler" = {
          Value = 1;
          Status = "default";
        };
      };
    };
  };

  home.sessionVariables.BROWSER = "zen-twilight";

  xdg.mimeApps.defaultApplications = browserAssociations;
}
