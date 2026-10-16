{
  config,
  lib,
  ...
}:
lib.mkIf config.custom.zsh.enable {
  programs.zsh.history = {
    size = 10000;
    save = 10000;
    path = "${config.home.homeDirectory}/.zsh_history";
    append = true;
    ignoreDups = true;
    ignoreAllDups = true;
    saveNoDups = true;
    findNoDups = true;
    ignoreSpace = true;
    expireDuplicatesFirst = true;
    share = true;
    extended = false;
  };
}
