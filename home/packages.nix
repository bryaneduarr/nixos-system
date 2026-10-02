# This file manages all of the user's packages.
{
  pkgs,
  inputs,
  lib,
  ...
}:
let
  engram = pkgs.callPackage ./packages/engram { };

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

    ${lib.concatMapStringsSep "\n" (pkg: ''${pkgs.bun}/bin/bun install -g "${pkg}" || true'') packages}
  '';
in
{
  systemd.user = {
    services.bun-cache-cleanup = {
      Unit = {
        Description = "Prune Bun's download cache";
      };

      Service = {
        Type = "oneshot";
        ExecStart = pkgs.writeShellScript "bun-cache-cleanup" ''
          set -euo pipefail

          install -d -m 700 "$HOME/.cache"
          exec 9>"$HOME/.cache/bun-maintenance.lock"
          ${pkgs.util-linux}/bin/flock 9

          export BUN_INSTALL="$HOME/.bun"
          ${pkgs.bun}/bin/bun pm cache rm
        '';
      };
    };

    timers.bun-cache-cleanup = {
      Unit = {
        Description = "Daily Bun cache cleanup";
      };

      Timer = {
        OnCalendar = "daily";
        Persistent = true;
        RandomizedDelaySec = "1h";
      };

      Install = {
        WantedBy = [ "timers.target" ];
      };
    };
  };

  # Install all of the user packages in here.
  home = {
    packages = with pkgs; [
      inputs.awww.packages.${pkgs.stdenv.hostPlatform.system}.default
      bibata-cursors
      awscli2
      bat
      biome
      bluetui
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
      google-chrome
      hyperfine
      jq
      killall
      kitty
      lazygit
      matugen
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
      rofi
      sqlite
      ssm-session-manager-plugin
      statix
      tailscale
      tree
      tree-sitter
      typescript-language-server
      unzip
      uv
      valgrind
      vscode
      wget
      wl-clipboard
      wtype
      wev
      yazi
      yq-go
      tmux
      tree
    ];

    activation = {
      installBunGlobalPackages = lib.hm.dag.entryAfter [ "linkGeneration" ] (bunGlobalInstall [
        "opencode-ai@latest"
        "tree-sitter-cli"
        "npm-check-updates"
        "agent-browser"
        "chrome-devtools-mcp@latest"
        "skills"
      ]);
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
