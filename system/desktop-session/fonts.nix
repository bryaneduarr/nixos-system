{
  config,
  lib,
  pkgs,
  ...
}:
let
  appearance = import ./appearance-constants.nix;
in
lib.mkIf config.custom.desktop-session.enable {
  fonts = {
    fontDir.enable = true;

    fontconfig.defaultFonts = {
      sansSerif = [ appearance.fonts.default ];
      serif = [ appearance.fonts.default ];
      monospace = [ appearance.fonts.monospace ];
    };

    packages = with pkgs; [
      figtree
      nerd-fonts.jetbrains-mono
    ];
  };
}
