{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.custom.postgresql;
in
{
  options.custom.postgresql.enable = lib.mkEnableOption "a local PostgreSQL server and its client tools";

  config = lib.mkIf cfg.enable {
    environment.systemPackages = [ pkgs.postgresql ];

    services.postgresql = {
      enable = true;
      package = pkgs.postgresql;
    };
  };
}
