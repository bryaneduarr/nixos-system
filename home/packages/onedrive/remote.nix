{ lib, ... }:
{
  options.my.onedrive = {
    remote = lib.mkOption {
      type = lib.types.str;
      default = "onedrive";
      description = ''
        Name of the rclone remote to mount. Set up once with `rclone config`
        (section name defaults to `onedrive`).
      '';
    };
  };
}
