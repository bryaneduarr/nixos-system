{ config, lib, ... }:
{
  options.my.onedrive = {
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
  };
}
