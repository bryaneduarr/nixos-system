{ pkgs, ... }:
{
  programs.fish = {
    enable = true;

    shellAliases = {
      l = "exa";
      ll = "exa -l";
      la = "exa -la";
      ls = "exa";
      cat = "bat";
      grep = "rg";
      find = "fd";
      top = "btop";
      c = "clear";
      ff = "fastfetch";
    };

    # Disable the welcome message.
    loginShellInit = ''
      set -g fish_greeting ""
    '';

    interactiveShellInit = ''
      set -gx EDITOR nvim

      fish_add_path /home/bryaneduarr/.bun/bin
      fish_add_path /home/bryaneduarr/.local/bin

      set -gx TZ "America/El_Salvador"

      set -gx FZF_DEFAULT_OPTS "--height 40% --layout=reverse --border --info=inline"

      set -gx fzf_directory_opts "--preview 'eza --tree --color=always --level=2 {}'"
      set -gx fzf_preview_file_cmd "bat --color=always --style=numbers,changes --line-range=:500"

      if type -q zoxide
        zoxide init fish | source
      end

      if type -q starship
        starship init fish | source
      end

      fish_vi_key_bindings
    '';

    functions = {
      nrs = ''
        sudo nixos-rebuild switch --flake path:$HOME/dot-files.nix#nixos $argv
      '';

      nfu = ''
        $HOME/dot-files.nix/scripts/update-all.sh $argv
      '';
    };
  };

  home.packages = with pkgs; [
    zoxide
  ];
}
