{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.custom.bun;

  activationPath = lib.makeBinPath [
    pkgs.bun
    pkgs.nodejs_latest
    pkgs.coreutils
    pkgs.bash
    pkgs.git
  ];

  takeMaintenanceLock = ''
    install -d -m 700 "$HOME/.cache"
    exec 9>"$HOME/.cache/bun-maintenance.lock"
    ${lib.getExe' pkgs.util-linux "flock"} 9
  '';

  globalPackages = [
    "@openai/codex@latest"
    "opencode-ai@latest"
    "@anthropic-ai/claude-code"
    "tree-sitter-cli"
    "npm-check-updates"
    "skills"
  ]
  ++ cfg.extraGlobalPackages;
in
{
  options.custom.bun = {
    enable = lib.mkEnableOption "Bun with global agent CLIs and a daily cache cleanup";

    extraGlobalPackages = lib.mkOption {
      type = lib.types.listOf lib.types.str;
      default = [ ];
      example = [ "agent-browser" ];
      description = "Additional npm packages installed globally with Bun on activation.";
    };
  };

  config = lib.mkIf cfg.enable {
    home = {
      packages = [ pkgs.bun ];

      activation.installBunGlobalPackages = lib.hm.dag.entryAfter [ "linkGeneration" ] ''
        export PATH="${activationPath}:$PATH"
        export BUN_INSTALL="$HOME/.bun"
        ${takeMaintenanceLock}
        ${lib.concatMapStringsSep "\n" (
          name: ''${lib.getExe pkgs.bun} install -g "${name}"''
        ) globalPackages}
      '';
    };

    systemd.user = {
      services.bun-cache-cleanup = {
        Unit.Description = "Prune Bun's download cache";

        Service = {
          Type = "oneshot";
          ExecStart = pkgs.writeShellScript "bun-cache-cleanup" ''
            set -euo pipefail
            ${takeMaintenanceLock}
            export BUN_INSTALL="$HOME/.bun"
            ${lib.getExe pkgs.bun} pm --global cache rm
          '';
        };
      };

      timers.bun-cache-cleanup = {
        Unit.Description = "Daily Bun cache cleanup";

        Timer = {
          OnCalendar = "daily";
          Persistent = true;
          RandomizedDelaySec = "1h";
        };

        Install.WantedBy = [ "timers.target" ];
      };
    };
  };
}
