# This file manages all of the user's packages.
{
  pkgs,
  inputs,
  ...
}:
{
  # Install all of the user packages in here.
  home.packages = with pkgs; [
    inputs.awww.packages.${pkgs.stdenv.hostPlatform.system}.default
    awscli2
    bat
    bluetui
    bun
    cargo
    clang-tools
    cmake
    curl
    deadnix
    eza
    fastfetch
    fd
    fzf
    gdb
    gcc
    git
    gnumake
    google-chrome
    jq
    killall
    kitty
    lazygit
    matugen
    neovim
    nil
    nixfmt-rfc-style
    nodejs_24
    nodePackages.npm-check-updates
    pnpm
    posting
    python3
    redis
    ripgrep
    rofi
    ssm-session-manager-plugin
    statix
    tree
    tree-sitter
    unzip
    uv
    valgrind
    vscode
    wget
    wl-clipboard
    yazi
    tmux
  ];

  home = {
    # Neovim specific spell spanish files with hashes and URL using Nix derivation.
    file.".config/nvim/spell/es.utf-8.spl".source = builtins.fetchurl {
      url = "https://ftp.nluug.nl/vim/runtime/spell/es.utf-8.spl";
      sha256 = "1qvv6sp4d25p1542vk0xf6argimlss9c7yh7y8dsby2wjan3fdln";
    };

    file.".config/nvim/spell/es.utf-8.sug".source = builtins.fetchurl {
      url = "https://ftp.nluug.nl/vim/runtime/spell/es.utf-8.sug";
      sha256 = "0v5x05438r8aym2lclvndmjbshsfzzxjhqq80pljlg35m9w383z7";
    };
  };
}
