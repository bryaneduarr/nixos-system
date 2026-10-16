{
  config,
  lib,
  ...
}:
let
  cfg = config.custom.kitty;
  appearance = import ../../system/desktop-session/appearance-constants.nix;
in
{
  imports = [
    ./keybindings.nix
    ./matugen.nix
  ];

  options.custom.kitty.enable = lib.mkEnableOption "the kitty terminal";

  config = lib.mkIf cfg.enable {
    programs.kitty = {
      enable = true;

      font = {
        name = appearance.fonts.monospace;
        size = 12.0;
      };

      settings = {
        cursor_shape = "beam";
        window_margin_width = "4";
        confirm_os_window_close = 0;
        background_opacity = "0.90";
        dynamic_background_opacity = true;
        allow_remote_control = "socket-only";
        listen_on = "unix:/tmp/kitty";
      };
    };
  };
}
