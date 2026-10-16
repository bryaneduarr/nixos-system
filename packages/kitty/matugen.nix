{
  config,
  lib,
  ...
}:
lib.mkIf config.custom.kitty.enable {
  programs.kitty.extraConfig = ''
    include ~/.config/kitty/matugen.conf
  '';
}
