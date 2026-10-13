{ pkgs, ... }:
{
  systemd.user = {
    services.bun-cache-cleanup = {
      Unit = {
        Description = "Prune Bun's download cache";
      };

      Service = {
        Type = "oneshot";
        ExecStart = pkgs.writeShellScript "bun-cache-cleanup" ''
          set -euo pipefail

          install -d -m 700 "$HOME/.cache"
          exec 9>"$HOME/.cache/bun-maintenance.lock"
          ${pkgs.util-linux}/bin/flock 9

          export BUN_INSTALL="$HOME/.bun"
          ${pkgs.bun}/bin/bun pm --global cache rm
        '';
      };
    };

    timers.bun-cache-cleanup = {
      Unit = {
        Description = "Daily Bun cache cleanup";
      };

      Timer = {
        OnCalendar = "daily";
        Persistent = true;
        RandomizedDelaySec = "1h";
      };

      Install = {
        WantedBy = [ "timers.target" ];
      };
    };
  };

}
