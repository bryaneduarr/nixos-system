{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.custom.development-tools;

  # Nixpkgs ships a stale pnpm dependency hash for this package.
  typescriptLanguageServer = pkgs.typescript-language-server.overrideAttrs (previous: {
    pnpmDeps =
      if previous.pnpmDeps.outputHash == "sha256-MUSxDMlbG21KSesGdEvqa2kEpuVfLlXRUX1qV/FGsSo=" then
        previous.pnpmDeps.overrideAttrs {
          outputHash = "sha256-xR/EF60lVBsITKgH7wCM2wHM46PFQevD51KfCENSUH4=";
        }
      else
        previous.pnpmDeps;
  });
in
{
  options.custom.development-tools.enable = lib.mkEnableOption "compilers, debuggers, language servers, linters, and service clients";

  config = lib.mkIf cfg.enable {
    home.packages = with pkgs; [
      awscli2
      biome
      bubblewrap
      cargo
      clang-tools
      cmake
      difftastic
      docker
      gcc
      gdb
      gh
      gnumake
      hyperfine
      lazygit
      lua-language-server
      nodejs_latest
      pnpm
      posting
      (python3.withPackages (
        ps: with ps; [
          sentence-transformers
          trafilatura
        ]
      ))
      redis
      shellcheck
      shfmt
      sqlite
      sqlite-vec
      ssm-session-manager-plugin
      stylua
      tree-sitter
      typescriptLanguageServer
      uv
      valgrind
    ];
  };
}
