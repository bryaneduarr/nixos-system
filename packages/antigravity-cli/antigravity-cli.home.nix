{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.custom.antigravity-cli;
  inherit (pkgs.stdenv.hostPlatform) system;

  # nfu rewrites release.json from the upstream release manifests.
  release = lib.importJSON ./release.json;
  latestAntigravityCli = pkgs.antigravity-cli.overrideAttrs {
    inherit (release) version;
    src = pkgs.fetchurl (
      release.sources.${system} or (throw "The Antigravity CLI release pin has no source for ${system}")
    );
  };
in
{
  options.custom.antigravity-cli.enable = lib.mkEnableOption "Antigravity CLI, the Google terminal agent client";

  config = lib.mkIf cfg.enable {
    home.packages = [ latestAntigravityCli ];
  };
}
