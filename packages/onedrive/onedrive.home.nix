{
  config,
  lib,
  osConfig,
  pkgs,
  ...
}:
let
  cfg = config.custom.onedrive;

  onedriveCommand = pkgs.writeShellApplication {
    name = "onedrive";
    runtimeInputs = with pkgs; [
      coreutils
      gawk
      gnused
      procps
      util-linux
      osConfig.systemd.package
    ];
    runtimeEnv = {
      SERVICE = "onedrive-mount.service";
      MOUNT = cfg.mountPoint;
      RCLONE = lib.getExe cfg.package;
      REMOTE = cfg.remote;
      CONFIG = "${config.home.homeDirectory}/.config/rclone/rclone.conf";
      VFS_DIR = "${config.home.homeDirectory}/.cache/rclone/vfs";
      CACHE_LIMIT = cfg.vfsCacheMaxSize;
      CACHE_AGE = cfg.vfsCacheMaxAge;
    };
    # Status checks rely on failing commands, so only unset variables abort.
    bashOptions = [ "nounset" ];
    text = builtins.readFile ./onedrive-command.sh;
  };
in
{
  imports = [ ./mount-service.nix ];

  options.custom.onedrive = {
    enable = lib.mkEnableOption "OneDrive rclone mount (VFS full cache, Files-On-Demand)";

    package = lib.mkOption {
      type = lib.types.package;
      default = pkgs.rclone;
      description = "rclone package used for the mount.";
    };

    remote = lib.mkOption {
      type = lib.types.str;
      default = "onedrive";
      description = "Name of the rclone remote to mount, as configured with `rclone config`.";
    };

    mountPoint = lib.mkOption {
      type = lib.types.path;
      default = "${config.home.homeDirectory}/OneDrive";
      description = "Where OneDrive is exposed. Unmounted, it stays an empty read-only placeholder.";
    };

    cacheDir = lib.mkOption {
      type = lib.types.path;
      default = "${config.home.homeDirectory}/.cache/rclone/onedrive";
      description = "Local VFS full-cache directory (uploads + download cache).";
    };

    extraFlags = lib.mkOption {
      type = lib.types.listOf lib.types.str;
      default = [ ];
      description = "Additional rclone mount flags (appended to the command).";
    };

    vfsCacheMaxSize = lib.mkOption {
      type = lib.types.str;
      default = "20G";
      description = "Max VFS cache size. Oldest data evicts automatically.";
    };

    vfsCacheMaxAge = lib.mkOption {
      type = lib.types.str;
      default = "720h";
      description = "Cached files unused for this long get evicted; `vfsCacheMaxSize` still bounds the total.";
    };

    # OneDrive change polling (--poll-interval, 1m) keeps long-lived listings current.
    dirCacheTime = lib.mkOption {
      type = lib.types.str;
      default = "1000h";
      description = "How long directory listings are cached before re-querying OneDrive.";
    };

    attrTimeout = lib.mkOption {
      type = lib.types.str;
      default = "30s";
      description = "How long file/directory attributes (size, mtime) are cached.";
    };
  };

  config = lib.mkIf cfg.enable {
    home.packages = [
      cfg.package
      onedriveCommand
    ];
  };
}
