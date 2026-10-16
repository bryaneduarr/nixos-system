{ inputs, ... }:
{
  imports = [
    inputs.nixos-wsl.nixosModules.default
    ./build-limits.nix
  ];

  wsl = {
    enable = true;
    defaultUser = "bryaneduarr";
  };

  custom = {
    docker.enable = true;
    nix-settings.enable = true;
    playwright.enable = true;
    postgresql.enable = true;
    remote-access.enable = true;
    user-account.enable = true;
    vscode.remoteServer.enable = true;
  };

  time.timeZone = "America/El_Salvador";
  system.stateVersion = "25.05";
}
