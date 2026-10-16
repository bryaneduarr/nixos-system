{
  lib,
  pkgs,
  ...
}:
{
  imports = [
    ./home-manager/activation-cleanup.nix
    ./home-manager/agent-settings.nix
    ./home-manager/installed-packages.nix
    ./home-manager/managed-files.nix
    ./home-manager/session-environment.nix
  ];

  options.custom.pi.enable = lib.mkEnableOption "the Pi coding agent with its harness, extensions, and settings";

  config._module.args.piTools = pkgs.callPackage ./pi-tools/pi-tools.nix { };
}
