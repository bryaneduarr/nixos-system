{ config, lib, ... }:
let
  cfg = config.my.onedrive;
in
{
  config = lib.mkIf cfg.enable {
    systemd.user.services.onedrive-mount = {
      # No network-* target under user systemd; Restart=on-failure covers
      # the case where the network is not reachable at login.
      Unit = {
        Description = "OneDrive mount via rclone (VFS full cache, Files-On-Demand)";
        Documentation = [ "https://rclone.org/commands/rclone_mount/" ];
        ConditionPathExists = "${config.home.homeDirectory}/.config/rclone/rclone.conf";
      };

      Service = {
        # rclone emits READY=1 once the mount is usable, so systemd only
        # reports started when the filesystem is actually mounted.
        Type = "notify";
        NotifyAccess = "main";
        Restart = "on-failure";
        RestartSec = "10";
        TimeoutStartSec = "120";
        TimeoutStopSec = "60";
      };

      Install = {
        WantedBy = [ "default.target" ];
      };
    };
  };
}
