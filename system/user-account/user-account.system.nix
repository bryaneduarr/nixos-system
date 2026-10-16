{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.custom.user-account;
in
{
  options.custom.user-account = {
    enable = lib.mkEnableOption "the bryaneduarr login account with passwordless nixos-rebuild";

    shell = lib.mkOption {
      type = lib.types.enum [
        "zsh"
        "fish"
      ];
      default = "zsh";
      description = "Login shell of the account.";
    };
  };

  config = lib.mkIf cfg.enable {
    programs.${cfg.shell}.enable = true;

    users = {
      users.bryaneduarr = {
        isNormalUser = true;
        description = "Bryan Eduardo";

        extraGroups = [
          "wheel"
          "networkmanager"
        ]
        ++ lib.optional config.virtualisation.docker.enable "docker";

        group = "bryaneduarr";
        home = "/home/bryaneduarr";
        createHome = true;
        shell = pkgs.${cfg.shell};
      };

      groups.bryaneduarr = { };
    };

    security.sudo = {
      enable = true;
      wheelNeedsPassword = true;

      extraRules = [
        {
          users = [ "bryaneduarr" ];
          commands = [
            {
              command = "/run/current-system/sw/bin/nixos-rebuild *";
              options = [ "NOPASSWD" ];
            }
          ];
        }
      ];
    };
  };
}
