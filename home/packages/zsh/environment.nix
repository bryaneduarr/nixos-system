{ config, ... }:
{
  home.sessionVariables = {
    EDITOR = "nvim";
    FZF_DEFAULT_OPTS = "--height 40% --layout=reverse --border --info=inline";
  };

  # Directories to PATH
  home.sessionPath = [
    "${config.home.homeDirectory}/.bun/bin"
    "${config.home.homeDirectory}/.local/bin"
    "${config.home.homeDirectory}/knowledge/nixos-system/bin"
  ];

  # Source brain environment for opencode knowledge base ignore/remove this if not interested.
  programs.zsh.initContent = ''
    # Brain knowledge base
    export BRAIN_ROOT="$HOME/knowledge/nixos-system"
    export PATH="$BRAIN_ROOT/bin:$PATH"
  '';
}
