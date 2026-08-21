{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.my.onedrive;
in
{
  config = lib.mkIf cfg.enable {
    systemd.user.services.onedrive-mount.Service = {
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

      ExecStart =
        let
          flags = [
            "--config=${config.home.homeDirectory}/.config/rclone/rclone.conf"
            "--vfs-cache-mode=full"
            "--vfs-cache-max-size=${cfg.vfsCacheMaxSize}"
            "--vfs-cache-max-age=${cfg.vfsCacheMaxAge}"
            "--dir-cache-time=${cfg.dirCacheTime}"
            "--attr-timeout=${cfg.attrTimeout}"
          ]
          ++ cfg.extraFlags;
        in
        lib.concatStringsSep " " (
          [
            "${cfg.package}/bin/rclone"
            "mount"
            "${cfg.remote}:"
            cfg.mountPoint
          ]
          ++ flags
        );
    };
  };
}
