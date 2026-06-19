_: {
  imports = [
    ./keybindings.nix
    ./matugen.nix
  ];

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
      background_opacity = "0.90";
      dynamic_background_opacity = true;
      allow_remote_control = "socket-only";
      listen_on = "unix:/tmp/kitty";
    };
  };
}
