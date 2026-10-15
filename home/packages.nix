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
      neovim
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
      sqlite-vec
      redis
      ripgrep
      sqlite
      ssm-session-manager-plugin
      statix
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

    # Neovim specific spell spanish files with hashes and URL using Nix derivation.
    file = {
      ".config/nvim/spell/es.utf-8.spl".source = builtins.fetchurl {
        url = "https://ftp.nluug.nl/vim/runtime/spell/es.utf-8.spl";
        sha256 = "1qvv6sp4d25p1542vk0xf6argimlss9c7yh7y8dsby2wjan3fdln";
      };

      ".config/nvim/spell/es.utf-8.sug".source = builtins.fetchurl {
        url = "https://ftp.nluug.nl/vim/runtime/spell/es.utf-8.sug";
        sha256 = "0v5x05438r8aym2lclvndmjbshsfzzxjhqq80pljlg35m9w383z7";
      };
    };
  };
}
