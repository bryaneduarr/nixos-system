{
  config,
  lib,
  ...
}:
let
  cfg = config.custom.git;
in
{
  options.custom.git.enable = lib.mkEnableOption "Git with the user identity";

  config = lib.mkIf cfg.enable {
    programs.git = {
      enable = true;
      settings.user = {
        name = "bryaneduarr";
        email = "bryaneduarr@gmail.com";
      };
    };
  };
}
