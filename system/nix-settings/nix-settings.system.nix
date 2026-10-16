{ config, lib, ... }:
let
  cfg = config.custom.nix-settings;
in
{
  options.custom.nix-settings = {
    enable = lib.mkEnableOption "flakes and the nix command";

    storeMaintenance.enable = lib.mkEnableOption "daily garbage collection and automatic store optimisation";

    sandboxResolvConf.enable = lib.mkEnableOption "/etc/resolv.conf inside the build sandbox";
  };

  config = lib.mkIf cfg.enable {
    nix = {
      settings = {
        experimental-features = [
          "nix-command"
          "flakes"
        ];
        auto-optimise-store = lib.mkIf cfg.storeMaintenance.enable true;
        extra-sandbox-paths = lib.mkIf cfg.sandboxResolvConf.enable [ "/etc/resolv.conf" ];
      };

      gc = lib.mkIf cfg.storeMaintenance.enable {
        automatic = true;
        dates = "daily";
        options = "--delete-older-than 14d";
      };
    };
  };
}
