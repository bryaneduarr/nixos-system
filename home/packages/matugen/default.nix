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
        post_hook = "killall -SIGUSR1 kitty";
      };

      zsh = {
        input_path = "~/.config/matugen/templates/zsh-syntax-highlighting.zsh";
        output_path = "~/.config/zsh/matugen-colors.zsh";
      };
    };
  };
in
{
  imports = [
    ./templates/kitty.nix
    ./templates/zsh-syntax-highlighting.nix
  ];

  xdg.configFile."matugen/config.toml".source =
    tomlFormat.generate "matugen-config.toml" matugenConfig;
}
