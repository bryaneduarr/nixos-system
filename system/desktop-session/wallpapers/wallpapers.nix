{
  inputs,
  lib,
  osConfig,
  pkgs,
  ...
}:
let
  wallpaperPackage = inputs.awww.packages.${pkgs.stdenv.hostPlatform.system}.default;
in
lib.mkIf osConfig.custom.desktop-session.enable {
  xdg.configFile = {
    "wallpapers/awww-matugen-init.sh" = {
      source = ./scripts/awww-matugen-init.sh;
      executable = true;
    };

    "wallpapers/awww-wallpaper-switch.sh" = {
      source = ./scripts/awww-wallpaper-switch.sh;
      executable = true;
    };
  };

  systemd.user.services.awww-daemon = {
    Unit = {
      Description = "awww wallpaper daemon";
      After = [ "graphical-session.target" ];
      PartOf = [ "graphical-session.target" ];
    };

    Service = {
      ExecStart = "${wallpaperPackage}/bin/awww-daemon";
      Restart = "on-failure";
      RestartSec = 0;
      StartLimitIntervalSec = 0;
    };

    Install.WantedBy = [ "graphical-session.target" ];
  };
}
