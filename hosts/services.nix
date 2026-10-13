_: {
  imports = [
    ./system-packages/docker.nix
    ./system-packages/postgresql.nix
    ./system-services/tailscale.nix
  ];

  services.openssh.enable = true;
}
