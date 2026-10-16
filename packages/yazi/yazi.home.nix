{
  config,
  lib,
  pkgs,
  yazi-plugins,
  ...
}:
let
  cfg = config.custom.yazi;
in
{
  options.custom.yazi = {
    enable = lib.mkEnableOption "the yazi file manager with plugins and previewers";
    videoPlayer.enable = lib.mkEnableOption "mpv for opening videos from yazi";

    shellWrapperName = lib.mkOption {
      type = lib.types.str;
      default = "y";
      description = "Name of the shell function that opens yazi and changes to its last directory.";
    };
  };

  config = lib.mkIf cfg.enable {
    programs.yazi = {
      enable = true;
      inherit (cfg) shellWrapperName;

      enableZshIntegration = true;

      settings = {
        plugin = {
          prepend_fetchers = [
            {
              url = "*";
              group = "git";
              run = "git";
            }
            {
              url = "*/";
              group = "git";
              run = "git";
            }
          ];
        };

        mgr = {
          show_hidden = true;
        };
      };

      plugins = {
        full-border = "${yazi-plugins}/full-border.yazi";
        git = "${yazi-plugins}/git.yazi";
      };

      initLua = ''
        -- Load all the plugins with lua here. Important to load here.
        require("full-border"):setup()
        require("git"):setup()
      '';
    };

    home.packages =
      with pkgs;
      [
        file
        bat
        eza
        fzf
        ffmpegthumbnailer
        imagemagick
        poppler-utils
        p7zip
        unrar
        unzip
      ]
      ++ lib.optional cfg.videoPlayer.enable mpv;
  };
}
