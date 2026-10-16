{
  lib,
  osConfig,
  ...
}:
lib.mkIf osConfig.custom.vscode.enable {
  programs.vscode = {
    enable = true;
  };
}
