{ lib, nodejs_latest }:
{
  pname = "declarative-pi-packages";
  version = "0.1.0";

  src = ../.;

  nodejs = nodejs_latest;
  dontNpmBuild = true;
  npmFlags = [ "--legacy-peer-deps" ];

  meta = {
    description = "Pinned npm packages used by the Pi Coding Agent";
    platforms = lib.platforms.unix;
  };
}
