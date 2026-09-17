{ pkgs, ... }:
let
  piTools = pkgs.callPackage ./pi-tools { };
in
{
  _module.args.piTools = piTools;

  imports = [
    ./home-manager/activation-cleanup.nix
    ./home-manager/agent-settings.nix
    ./home-manager/installed-packages.nix
    ./home-manager/managed-files.nix
    ./home-manager/session-environment.nix
  ];
}
