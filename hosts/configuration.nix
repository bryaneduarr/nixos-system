{
  pkgs,
  ...
}:
let
  appearance = import ../home/desktop/appearance-constants.nix;
in
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

  desktop.compositor = "niri"; # niri, hyprland

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

    fontconfig.defaultFonts = {
      sansSerif = [ appearance.fonts.default ];
      serif = [ appearance.fonts.default ];
      monospace = [ appearance.fonts.monospace ];
    };

    packages = with pkgs; [
      figtree
      nerd-fonts.jetbrains-mono
    ];
  };

  system.stateVersion = "26.05";
}
