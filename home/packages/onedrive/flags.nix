{ lib, ... }:
{
  options.my.onedrive = {
    extraFlags = lib.mkOption {
      type = lib.types.listOf lib.types.str;
      default = [ ];
      description = "Additional rclone mount flags (appended to the command).";
    };
  };
}
