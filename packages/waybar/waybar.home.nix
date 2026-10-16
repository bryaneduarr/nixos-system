{
  config,
  lib,
  osConfig,
  pkgs,
  ...
}:
let
  cfg = config.custom.waybar;
  compositor = osConfig.custom.desktop-session.compositor;
  hyprlandEnabled = compositor == "hyprland";
in
{
  options.custom.waybar.enable = lib.mkEnableOption "the Waybar status bar for Hyprland";

  config = lib.mkIf cfg.enable {
    programs.waybar = {
      enable = hyprlandEnabled;
      package = pkgs.waybar;

      systemd = {
        enable = hyprlandEnabled;
        targets = [ "graphical-session.target" ];
      };

      settings = {
        mainBar = {
          layer = "top";
          position = "top";
          height = 34;
          spacing = 4;

          modules-left = [
            "${compositor}/workspaces"
            "${compositor}/window"
          ];

          modules-center = [ "clock" ];

          modules-right = [
            "pulseaudio"
            "network"
            "cpu"
            "memory"
            "tray"
          ];

          "${compositor}/workspaces" = {
            all-outputs = true;
            format = "{icon}";
            format-icons = {
              "1" = "1";
              "2" = "2";
              "3" = "3";
              "4" = "4";
              "5" = "5";
              urgent = "";
              focused = "";
              default = "";
            };
          };

          "${compositor}/window" = {
            format = "{}";
            max-length = 50;
          };

          clock = {
            format = "{:%H:%M}";
            format-alt = "{:%A, %B %d, %Y (%R)}";
            tooltip-format = "<tt><small>{calendar}</small></tt>";
            calendar = {
              mode = "year";
              mode-mon-col = 3;
              weeks-pos = "right";
              on-scroll = 1;
              format = {
                months = "<span color='#ffead3'><b>{}</b></span>";
                days = "<span color='#ecc6d9'><b>{}</b></span>";
                weeks = "<span color='#99ffdd'><b>W{}</b></span>";
                weekdays = "<span color='#ffcc66'><b>{}</b></span>";
                today = "<span color='#ff6699'><b><u>{}</u></b></span>";
              };
            };
          };

          cpu = {
            format = " {usage}%";
            tooltip = false;
          };

          memory = {
            format = " {}%";
          };

          network = {
            format-wifi = " {essid} ({signalStrength}%)";
            format-ethernet = " {ipaddr}/{cidr}";
            tooltip-format = " {ifname} via {gwaddr}";
            format-linked = " {ifname} (No IP)";
            format-disconnected = "⚠ Disconnected";
            format-alt = "{ifname}: {ipaddr}/{cidr}";
          };

          pulseaudio = {
            format = "{icon} {volume}%";
            format-muted = " Muted";
            format-icons = {
              headphone = "";
              hands-free = "";
              headset = "";
              phone = "";
              portable = "";
              car = "";
              default = [
                ""
                ""
                ""
              ];
            };
            on-click = "pavucontrol";
          };

          tray = {
            spacing = 10;
          };
        };
      };

      style = import ./style.nix;
    };
  };
}
