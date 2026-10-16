{ config, lib, ... }:
lib.mkIf config.custom.desktop-session.enable {
  services.keyd = {
    enable = true;
    keyboards.default = {
      ids = [ "*" ];
      settings.main.rightalt = "macro(C-b)";
    };
  };
}
