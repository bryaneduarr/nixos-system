{ pkgs, ... }:
let
  tomlFormat = pkgs.formats.toml { };

  matugenConfig = {
    config = {
      reload_apps = false;
    };

    templates = {
      kitty = {
        input_path = "~/.config/matugen/templates/kitty.conf";
        output_path = "~/.config/kitty/matugen.conf";
      };

      zsh = {
        input_path = "~/.config/matugen/templates/zsh-syntax-highlighting.zsh";
        output_path = "~/.config/zsh/matugen-colors.zsh";
      };

      nvim = {
        input_path = "~/.config/matugen/templates/nvim-colors.lua";
        output_path = "~/.config/nvim/lua/matugen_colors.lua";
        post_hook = "pkill -USR1 nvim || true";
      };
    };
  };
in
{
  imports = [
    ./templates/kitty.nix
    ./templates/neovim.nix
    ./templates/zsh-syntax-highlighting.nix
  ];

  xdg.configFile."matugen/config.toml".source =
    tomlFormat.generate "matugen-config.toml" matugenConfig;
}
