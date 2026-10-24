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
    brotli
    dnsutils
    fd
    jq
    lsof
    piTools
    psmisc
    ripgrep
    typescript
    vtsls
    xxd
    yq-go
  ];
}
