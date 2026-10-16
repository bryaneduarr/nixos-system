{ lib, nodejs_24 }:
{
  pname = "declarative-pi-packages";
  version = "0.1.0";

  src = ../.;

  nodejs = nodejs_24;
  dontNpmBuild = true;
  npmFlags = [ "--legacy-peer-deps" ];

  meta = {
    description = "Pinned npm packages used by the Pi Coding Agent";
    platforms = lib.platforms.unix;
  };
}
