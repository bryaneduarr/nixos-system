{ lib, pkgs }:
{
  installMode = "off";
  warmup = true;
  servers.vtsls.install = {
    type = "system";
    command = [
      (lib.getExe pkgs.vtsls)
      "--stdio"
    ];
  };
}
