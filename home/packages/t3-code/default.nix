{
  lib,
  stdenvNoCC,
  appimage-run,
  fetchurl,
  makeWrapper,
}:
let
  release = import ./release-source.nix { inherit fetchurl; };
  installPhase = import ./install-appimage.nix { inherit appimage-run; };
  meta = import ./package-metadata.nix { inherit lib; };
in
stdenvNoCC.mkDerivation {
  pname = "t3code";
  inherit (release) version src;

  dontUnpack = true;

  nativeBuildInputs = [ makeWrapper ];

  inherit installPhase meta;
}
