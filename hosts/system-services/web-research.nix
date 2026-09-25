{ pkgs, ... }:
let
  secretsDir = "/var/lib/web-research";
  crawl4aiEnv = "${secretsDir}/crawl4ai.env";
in
{
  # Generate persistent secrets on the host, never in the Nix store or Git.
  systemd.services.web-research-secrets = {
    description = "Generate local web research secrets";
    serviceConfig = {
      Type = "oneshot";
      RemainAfterExit = true;
      UMask = "0077";
    };
    script = ''
      ${pkgs.coreutils}/bin/install -d -m 0750 -o root -g bryaneduarr ${secretsDir}
      if [ ! -s ${secretsDir}/searx.env ]; then
        printf 'SEARX_SECRET_KEY=%s\n' "$(${pkgs.openssl}/bin/openssl rand -hex 32)" > ${secretsDir}/searx.env
      fi
      ${pkgs.coreutils}/bin/chown root:root ${secretsDir}/searx.env
      ${pkgs.coreutils}/bin/chmod 0600 ${secretsDir}/searx.env
      if [ ! -s ${crawl4aiEnv} ]; then
        printf 'CRAWL4AI_API_TOKEN=%s\n' "$(${pkgs.openssl}/bin/openssl rand -hex 32)" > ${crawl4aiEnv}
      fi
      ${pkgs.coreutils}/bin/chown root:bryaneduarr ${crawl4aiEnv}
      ${pkgs.coreutils}/bin/chmod 0640 ${crawl4aiEnv}
    '';
  };

  services.searx = {
    enable = true;
    openFirewall = false;
    environmentFile = "${secretsDir}/searx.env";
    settings = {
      search.formats = [ "html" "json" ];
      server = {
        bind_address = "127.0.0.1";
        port = 8888;
        secret_key = "$SEARX_SECRET_KEY";
      };
    };
  };
  systemd.services.searx-init = {
    requires = [ "web-research-secrets.service" ];
    after = [ "web-research-secrets.service" ];
  };

  # Docker is already enabled by hosts/system-packages/docker.nix.
  virtualisation.oci-containers = {
    backend = "docker";
    containers.crawl4ai = {
      image = "docker.io/unclecode/crawl4ai:0.9.4@sha256:9021b3cb5c6f12570bbcd5395638495e0a06969b3148e377b953d174af2ebc9b";
      ports = [ "127.0.0.1:11235:11235" ];
      environmentFiles = [ crawl4aiEnv ];
      extraOptions = [ "--shm-size=1g" ];
    };
  };
  systemd.services.docker-crawl4ai = {
    requires = [ "web-research-secrets.service" ];
    after = [ "web-research-secrets.service" ];
  };
}
