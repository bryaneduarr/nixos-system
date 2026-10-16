{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.custom.onedrive;

  mountFlags = [
    "--config=${config.home.homeDirectory}/.config/rclone/rclone.conf"
    "--vfs-cache-mode=full"
    "--vfs-cache-max-size=${cfg.vfsCacheMaxSize}"
    "--vfs-cache-max-age=${cfg.vfsCacheMaxAge}"
    "--dir-cache-time=${cfg.dirCacheTime}"
    "--attr-timeout=${cfg.attrTimeout}"
  ]
  ++ cfg.extraFlags;
in
lib.mkIf cfg.enable {
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

      # systemd strips PATH, and NixOS has no fusermount in /bin:/usr/bin.
      # The setuid wrapper lives in /run/wrappers/bin.
      Environment = [
        "PATH=/run/wrappers/bin:/run/current-system/sw/bin:/nix/var/nix/profiles/default/bin"
      ];

      # fusermount can only mount over a dir the user can write. A read-only
      # placeholder makes rclone die and restart in a loop.
      ExecStartPre = pkgs.writeShellScript "onedrive-mount-pre" ''
        set -eu
        mkdir -p "${cfg.mountPoint}" "${cfg.cacheDir}"
        chmod 0755 "${cfg.mountPoint}"
      '';

      ExecStart = lib.concatStringsSep " " (
        [
          "${cfg.package}/bin/rclone"
          "mount"
          "${cfg.remote}:"
          cfg.mountPoint
        ]
        ++ mountFlags
      );
    };

    Install.WantedBy = [ "default.target" ];
  };
}
