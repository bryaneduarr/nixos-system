{
  pkgs,
  ...
}:
{
  imports = [
    ./hardware-configuration.nix

    ./system/boot-loader.nix
    ./system/gpu.nix
    ./system/users.nix

    ./system-packages/desktop.nix
    ./system-packages/postgresql.nix
    ./system-packages/docker.nix

    ./system-services/web-research.nix

    ./system-services/default.nix
    ./system-services/tailscale.nix
    ./system-services/ly.nix
    ./system-services/keyd.nix
  ];

  desktop.compositor = "hyprland";

  nix = {
    settings = {
      experimental-features = [
        "nix-command"
        "flakes"
      ];
      auto-optimise-store = true;
      extra-sandbox-paths = [ "/etc/resolv.conf" ];
    };

    gc = {
      automatic = true;
      dates = "daily";
      options = "--delete-older-than 14d";
    };
  };

  hardware.bluetooth.enable = true;

  networking = {
    hostName = "nixos";
    networkmanager.enable = true;
  };

  programs.zsh.enable = true;

  security.sudo = {
    enable = true;
    wheelNeedsPassword = true;

    extraRules = [
      {
        groups = [ "wheel" ];
        commands = [
          {
            command = "${pkgs.nixos-rebuild}/bin/nixos-rebuild";
            options = [ "NOPASSWD" ];
          }
        ];
      }
    ];
  };

  time = {
    timeZone = "America/El_Salvador";
    hardwareClockInLocalTime = true;
  };

  fonts = {
    fontDir.enable = true;
    packages = with pkgs; [
      nerd-fonts.jetbrains-mono
    ];
  };

  system.stateVersion = "26.05";
}
