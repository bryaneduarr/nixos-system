# This file manages all of the user's packages.
{
  pkgs,
  desktopTools ? true,
  lib,
  ...
}:
let
  engram = pkgs.callPackage ./packages/engram { };

  typescriptLanguageServer = pkgs.typescript-language-server.overrideAttrs (previous: {
    pnpmDeps =
      if previous.pnpmDeps.outputHash == "sha256-MUSxDMlbG21KSesGdEvqa2kEpuVfLlXRUX1qV/FGsSo=" then
        previous.pnpmDeps.overrideAttrs {
          outputHash = "sha256-xR/EF60lVBsITKgH7wCM2wHM46PFQevD51KfCENSUH4=";
        }
      else
        previous.pnpmDeps;
  });

  activationPath = lib.makeBinPath [
    pkgs.bun
    pkgs.nodejs_latest
    pkgs.coreutils
    pkgs.bash
    pkgs.git
  ];

  bunGlobalInstall = packages: ''
    export PATH="${activationPath}:$PATH"
    export BUN_INSTALL="$HOME/.bun"
    install -d -m 700 "$HOME/.cache"
    exec 9>"$HOME/.cache/bun-maintenance.lock"
    ${pkgs.util-linux}/bin/flock 9

    ${lib.concatMapStringsSep "\n" (pkg: ''${pkgs.bun}/bin/bun install -g "${pkg}"'') packages}
  '';
in
{

  # Install all of the user packages in here.
  home = {
    packages = with pkgs; [
      awscli2
      bat
      biome
      bubblewrap
      bun
      cargo
      clang-tools
      cmake
      curl
      docker
      deadnix
      difftastic
      engram
      eza
      fastfetch
      fd
      ffmpeg
      fzf
      gdb
      gcc
      gh
      git
      gnumake
      herdr
      hyperfine
      jq
      killall
      lazygit
      lua-language-server
      nil
      nixfmt
      nodejs_latest
      pnpm
      posting
      (python3.withPackages (
        ps: with ps; [
          sentence-transformers
          trafilatura
        ]
      ))
      shellcheck
      shfmt
      sqlite-vec
      redis
      ripgrep
      sqlite
      ssm-session-manager-plugin
      statix
      stylua
      tailscale
      tree
      tree-sitter
      typescriptLanguageServer
      unzip
      uv
      valgrind
      wget
      yazi
      yq-go
      tmux
      tree
    ];

    activation = {
      installBunGlobalPackages = lib.hm.dag.entryAfter [ "linkGeneration" ] (
        bunGlobalInstall (
          [
            "opencode-ai@latest"
            "@anthropic-ai/claude-code"
            "tree-sitter-cli"
            "npm-check-updates"
          ]
          ++ lib.optionals desktopTools [
            "agent-browser"
            "chrome-devtools-mcp@latest"
          ]
          ++ [ "skills" ]
          ++ lib.optionals (!desktopTools) [ "@openai/codex@latest" ]
        )
      );
    };
  };
}
