{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.my.onedrive;

  # Script is split across cli/ parts, concatenated in order at build time.
  script = lib.concatStringsSep "\n" [
    (import ./common.nix { inherit cfg config; })
    (import ./status.nix { inherit cfg config; })
    (import ./control.nix { inherit cfg config; })
    (import ./dispatch.nix { inherit cfg config; })
  ];
in
{
  config = lib.mkIf cfg.enable {
    home.packages = [
      cfg.package
      # Control command: status | start | stop | restart. Works in any shell.
      (pkgs.writeShellScriptBin "onedrive" script)
    ];
  };
}
