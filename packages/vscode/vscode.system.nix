{ config, lib, ... }:
let
  cfg = config.custom.vscode;
in
{
  options.custom.vscode = {
    enable = lib.mkEnableOption "the Visual Studio Code desktop editor";

    remoteServer.enable = lib.mkEnableOption "nix-ld so the VS Code remote server runs over SSH";
  };

  config = lib.mkIf cfg.remoteServer.enable {
    programs.nix-ld.enable = true;
  };
}
