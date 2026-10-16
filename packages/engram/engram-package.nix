{
  buildGoModule,
  fetchFromGitHub,
  git,
  lib,
}:
let
  version = "2.2.1";
in
buildGoModule {
  pname = "engram";
  inherit version;

  src = fetchFromGitHub {
    owner = "Gentleman-Programming";
    repo = "engram";
    rev = "v${version}";
    hash = "sha256-unN6bMnxVJAq3S3DsJCq2rUUddycwkYHGFs92hc+tQU=";
  };

  vendorHash = "sha256-roVQ+K9Hsz0qi61f+zzb+JvgleOmBHSMcKfhwhI0snQ=";

  subPackages = [ "cmd/engram" ];

  nativeCheckInputs = [ git ];

  ldflags = [
    "-s"
    "-w"
    "-X"
    "main.version=${version}"
  ];

  meta = {
    description = "Persistent memory system for AI coding agents";
    homepage = "https://github.com/Gentleman-Programming/engram";
    license = lib.licenses.mit;
    mainProgram = "engram";
    platforms = lib.platforms.linux;
  };
}
