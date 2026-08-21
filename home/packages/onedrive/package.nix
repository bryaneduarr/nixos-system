{ lib, pkgs, ... }:
{
  options.my.onedrive = {
    package = lib.mkOption {
      type = lib.types.package;
      default = pkgs.rclone;
      description = "rclone package used for the mount.";
    };
  };
}
