_: {
  imports = [
    ./hardware-configuration.nix
    ./boot-loader.nix
    ./nvidia-gpu.nix
  ];

  custom = {
    desktop-session = {
      enable = true;
      compositor = "niri";
    };

    docker.enable = true;

    nix-settings = {
      enable = true;
      storeMaintenance.enable = true;
      sandboxResolvConf.enable = true;
    };

    postgresql.enable = true;
    remote-access.enable = true;
    user-account.enable = true;

    vscode = {
      enable = true;
      remoteServer.enable = true;
    };

    web-research.enable = true;
  };

  networking.hostName = "nixos";

  time = {
    timeZone = "America/El_Salvador";
    hardwareClockInLocalTime = true;
  };

  system.stateVersion = "26.05";
}
