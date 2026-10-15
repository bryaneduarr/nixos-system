{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.custom.neovim;
in
{
  options.custom.neovim.enable = lib.mkEnableOption "Neovim with the Lua configuration from the nvim folder";

  config = lib.mkIf cfg.enable {
    home.packages = [ pkgs.neovim ];

    xdg = {
      # Links the checkout instead of the store so lazy.nvim can write lazy-lock.json.
      configFile.nvim.source = config.lib.file.mkOutOfStoreSymlink "${config.home.homeDirectory}/nixos-system/nvim";

      dataFile = {
        "nvim/site/spell/es.utf-8.spl".source = builtins.fetchurl {
          url = "https://ftp.nluug.nl/vim/runtime/spell/es.utf-8.spl";
          sha256 = "1qvv6sp4d25p1542vk0xf6argimlss9c7yh7y8dsby2wjan3fdln";
        };

        "nvim/site/spell/es.utf-8.sug".source = builtins.fetchurl {
          url = "https://ftp.nluug.nl/vim/runtime/spell/es.utf-8.sug";
          sha256 = "0v5x05438r8aym2lclvndmjbshsfzzxjhqq80pljlg35m9w383z7";
        };
      };
    };
  };
}
