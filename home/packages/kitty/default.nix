_: {
  programs.kitty = {
    enable = true;

    font = {
      name = "JetBrains Mono Nerd Font";
      size = 12.0;
    };

    settings = {
      cursor_shape = "beam";
      window_margin_width = "4";
      confirm_os_window_close = 0;
    };
  }
  // import ./keybindings.nix;
}
