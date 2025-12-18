{ pkgs, yazi-plugins, ... }:
{
  programs.yazi = {
    enable = true;

    enableZshIntegration = true;

    settings = {
      plugin = {
        prepend_fetchers = [
          {
            id = "git";
            name = "*";
            run = "git";
          } # Register git fetchers ahead of defaults. This is for the plugin git to work correctly.
          {
            id = "git";
            name = "*/";
            run = "git";
          } # Default git fetcher.
        ];
      };

      mgr = {
        show_hidden = true; # Hidden files.
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

  # These packages enhance file management and media handling capabilities in the user's environment when using yazi.
  home.packages = with pkgs; [
    file # for determining file types.
    bat # a cat clone with syntax highlighting.
    eza # a modern replacement for 'ls'.
    fzf # a command-line fuzzy finder.
    ffmpegthumbnailer # for generating video thumbnails.
    imagemagick # a suite for image manipulation.
    poppler-utils # PDF utilities (e.g., pdftotext).
    mpv # a media player.
    p7zip # 7z archive tool.
    unrar # tool for extracting RAR archives.
    unzip # tool for extracting ZIP archives.
  ];
}
