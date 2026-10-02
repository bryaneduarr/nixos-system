{
  config,
  lib,
  pkgs,
  ...
}:
let
  installer = pkgs.writeShellApplication {
    name = "t3code-install";
    runtimeInputs = [
      pkgs.bash
      pkgs.coreutils
      pkgs.curl
      pkgs.gnugrep
      pkgs.gnused
      pkgs.gnutar
      pkgs.gzip
      pkgs.jq
      pkgs.util-linux
    ];
    text = builtins.readFile ./install.sh;
  };

  desktopUpdater = pkgs.writeShellApplication {
    name = "t3code-update";
    text = ''
      exec ${installer}/bin/t3code-install --update-desktop "$@"
    '';
  };
in
{
  home = {
    packages = [
      installer
      desktopUpdater
    ];

    sessionPath = lib.mkBefore [ "${config.home.homeDirectory}/.local/bin" ];

    file.".local/bin/t3code" = {
      executable = true;
      text = ''
        #!${pkgs.bash}/bin/bash
        set -euo pipefail

        appimage="''${XDG_DATA_HOME:-$HOME/.local/share}/t3code/T3-Code.AppImage"
        if [ ! -s "$appimage" ]; then
          printf 'T3 Code is not installed. Run t3code-install first.\n' >&2
          exit 1
        fi

        export T3CODE_DISABLE_AUTO_UPDATE=1
        exec ${pkgs.appimage-run}/bin/appimage-run "$appimage" "$@"
      '';
    };

    activation.installT3Code = lib.hm.dag.entryAfter [ "linkGeneration" ] ''
      if ! run ${installer}/bin/t3code-install; then
        printf 'T3 Code bootstrap failed. Run t3code-install to retry.\n' >&2
      fi
    '';
  };

  xdg = {
    desktopEntries.t3code-local = {
      name = "T3 Code";
      exec = "${config.home.homeDirectory}/.local/bin/t3code %U";
      terminal = false;
      categories = [ "Development" ];
      mimeType = [ "x-scheme-handler/t3code" ];
      settings.StartupWMClass = "com.t3tools.T3Code";
    };

    mimeApps.defaultApplications."x-scheme-handler/t3code" = [ "t3code-local.desktop" ];
  };
}
