{ config, lib, ... }:
let
  cfg = config.custom.docker;
in
{
  options.custom.docker.enable = lib.mkEnableOption "the Docker daemon";

  config = lib.mkIf cfg.enable {
    virtualisation.docker.enable = true;
  };
}
