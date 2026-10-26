{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.custom.pi;
in
lib.mkIf cfg.enable {
  home.packages = with pkgs; [
    ast-grep
    brotli
    dnsutils
    fd
    jq
    lsof
    cfg.tools
    psmisc
    ripgrep
    typescript
    vtsls
    xxd
    yq-go
  ];
}
