{
  config,
  lib,
  piTools,
  pkgs,
  ...
}:
lib.mkIf config.custom.pi.enable {
  home.packages = with pkgs; [
    ast-grep
    piTools
    typescript
    vtsls
  ];
}
