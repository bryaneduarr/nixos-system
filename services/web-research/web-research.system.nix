{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.custom.web-research;
  secretsDir = "/var/lib/web-research";
  generateSecrets = pkgs.writeShellApplication {
    name = "generate-web-research-secrets";
    runtimeInputs = with pkgs; [
      coreutils
      openssl
    ];
    text = builtins.readFile ./generate-secrets.sh;
  };
  requiresSecrets = {
    requires = [ "web-research-secrets.service" ];
    after = [ "web-research-secrets.service" ];
  };
in
{
  options.custom.web-research.enable = lib.mkEnableOption "local SearXNG search and the Crawl4AI crawler for web research";

  config = lib.mkIf cfg.enable {
    assertions = [
      {
        assertion = config.virtualisation.docker.enable;
        message = "custom.web-research runs Crawl4AI in Docker; enable custom.docker.";
      }
    ];

    services.searx = {
      enable = true;
      openFirewall = false;
      environmentFile = "${secretsDir}/searx.env";
      settings = {
        search.formats = [
          "html"
          "json"
        ];
        server = {
          bind_address = "127.0.0.1";
          port = 8888;
          secret_key = "$SEARX_SECRET_KEY";
        };
      };
    };

    systemd.services = {
      # Secrets are generated on the host so they never enter the Nix store or Git.
      web-research-secrets = {
        description = "Generate local web research secrets";
        environment = {
          SECRETS_DIR = secretsDir;
          SECRETS_GROUP = config.users.users.bryaneduarr.group;
        };
        serviceConfig = {
          Type = "oneshot";
          RemainAfterExit = true;
          UMask = "0077";
          ExecStart = lib.getExe generateSecrets;
        };
      };

      searx-init = requiresSecrets;
      docker-crawl4ai = requiresSecrets;
    };

    virtualisation.oci-containers = {
      backend = "docker";
      containers.crawl4ai = {
        image = "docker.io/unclecode/crawl4ai:0.9.4@sha256:9021b3cb5c6f12570bbcd5395638495e0a06969b3148e377b953d174af2ebc9b";
        ports = [ "127.0.0.1:11235:11235" ];
        environmentFiles = [ "${secretsDir}/crawl4ai.env" ];
        extraOptions = [ "--shm-size=1g" ];
      };
    };
  };
}
