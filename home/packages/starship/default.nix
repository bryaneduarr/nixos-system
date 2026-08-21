{ pkgs, ... }:
{
  home.packages = with pkgs; [
    starship
  ];

  programs.starship = {
    enable = true;

    settings = {
      add_newline = false;

      format = "(bold overlay1) $directory$git_branch$git_status$kubernetes $time\n$character";

      character = {
        format = "[╰$symbol](fg:overlay1) ";
        success_symbol = "[/](fg:bold text)";
        error_symbol = "[/](fg:bold red)";
      };

      directory = {
        format = "$path";
        truncation_length = 3;
        truncation_symbol = "…/";
      };

      git_branch = {
        style = "fg:color_yellow";
        disabled = false;
        symbol = "";
        format = "( | $branch)";
      };

      git_status = {
        disabled = false;
        style = "fg:color_orange";
        format = "([$all_status]($style))";
        modified = "";
        deleted = "";
        renamed = "";
        stashed = "";
        untracked = "";
        staged = "";
        conflicted = "";
      };
    };
  };
}
