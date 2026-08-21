{ lib, ... }:
{
  options.my.onedrive = {
    enable = lib.mkEnableOption "OneDrive rclone mount (VFS full cache, Files-On-Demand)";
  };
}
