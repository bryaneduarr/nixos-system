{
  config,
  lib,
  ...
}:
lib.mkIf config.custom.zsh.enable {
  home = {
    sessionVariables = {
      EDITOR = "nvim";
      FZF_DEFAULT_OPTS = "--height 40% --layout=reverse --border --info=inline";
    };

    sessionPath = [
      "${config.home.homeDirectory}/.bun/bin"
      "${config.home.homeDirectory}/.local/bin"
      "${config.home.homeDirectory}/knowledge/nixos-system/bin"
    ];
  };

  programs.zsh.initContent = ''
    export BRAIN_ROOT="$HOME/knowledge/nixos-system"
    export PATH="$BRAIN_ROOT/bin:$PATH"
  '';
}
