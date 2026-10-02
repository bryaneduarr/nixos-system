{
  config,
  lib,
  pkgs,
  ...
}:
let
  hyprlandConfigPath = "${config.xdg.configHome}/hypr/hyprland.conf";
in
{
  xdg.configFile."hypr/hyprland.conf".force = true;

  wayland.windowManager.hyprland = {
    enable = true;
    configType = "hyprlang";

    settings = {
      animations.enabled = true;

      monitor = "DP-3,1920x1080@280,0x0,1";

      windowrule = [ ];

      exec-once = [
        "hyprctl setcursor Bibata-Modern-Classic 24"
        "systemctl --user import-environment WAYLAND_DISPLAY"
        "bash $HOME/.config/wallpapers/awww-matugen-init.sh"
      ];
    }
    // import ./animations.nix
    // import ./decoration.nix
    // import ./general.nix
    // import ./cursor.nix
    // import ./input.nix
    // import ./keybindings.nix { inherit pkgs; }
    // import ./miscellaneous.nix;
  };

  home = {
    activation.backupUnmanagedHyprlandConfig =
      lib.hm.dag.entryBetween [ "linkGeneration" ] [ "writeBoundary" ]
        ''
          hyprland_config=${lib.escapeShellArg hyprlandConfigPath}

          if [[ -f "$hyprland_config" && ! -L "$hyprland_config" ]]; then
            backup_path="$hyprland_config.unmanaged.$(${pkgs.coreutils}/bin/date +%s%N)"
            run ${pkgs.coreutils}/bin/cp --preserve=mode,timestamps -- "$hyprland_config" "$backup_path"
          fi
        '';

    file.".config/hypr/scripts/right-alt-trigger.sh" = {
      source = ./scripts/right-alt-trigger.sh;
      executable = true;
    };
  };
}
