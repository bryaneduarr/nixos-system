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

    ./system-packages/hyprland.nix
    ./system-packages/postgresql.nix

    ./system-services/default.nix
    ./system-services/ly.nix
    ./system-services/keyd.nix
  ];

  nix.settings.experimental-features = [
    "nix-command"
    "flakes"
  ];

  hardware.bluetooth.enable = true;

  networking.hostName = "nixos";

  networking.networkmanager.enable = true;

  programs.zsh.enable = true;

  security.sudo.enable = true;
  security.sudo.wheelNeedsPassword = true;

  time.timeZone = "America/El_Salvador";

  fonts = {
    fontDir.enable = true;
    packages = with pkgs; [
      nerd-fonts.jetbrains-mono
    ];
  };

  time.hardwareClockInLocalTime = true;

  system.stateVersion = "25.05";
}
