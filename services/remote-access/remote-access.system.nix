{ config, lib, ... }:
let
  cfg = config.custom.remote-access;
in
{
  options.custom.remote-access.enable = lib.mkEnableOption "SSH and Tailscale access to the machine";

  config = lib.mkIf cfg.enable {
    services = {
      openssh.enable = true;
      tailscale.enable = true;
    };
  };
}
