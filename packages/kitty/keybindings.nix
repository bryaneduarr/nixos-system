{
  config,
  lib,
  ...
}:
lib.mkIf config.custom.kitty.enable {
  programs.kitty.keybindings = {
    "ctrl+c" = "copy_or_interrupt";
    "ctrl+v" = "paste_from_clipboard";

    "page_up" = "scroll_page_up";
    "page_down" = "scroll_page_down";
    "ctrl+plus" = "change_font_size all +1";
    "ctrl+equal" = "change_font_size all +1";
    "ctrl+kp_add" = "change_font_size all +1";
    "ctrl+minus" = "change_font_size all -1";
    "ctrl+underscore" = "change_font_size all -1";
    "ctrl+kp_subtract" = "change_font_size all -1";
    "ctrl+0" = "change_font_size all 0";
    "ctrl+kp_0" = "change_font_size all 0";
  };
}
