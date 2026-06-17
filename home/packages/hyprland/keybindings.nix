{
  bind = [
    "SUPER, T, exec, kitty"
    "SUPER, Q, killactive"
    "SUPER, M, exit"
    "SUPER, V, togglefloating"
    "SUPER, R, exec, rofi -show drun"
    "SUPER, P, pseudo"
    "SUPER, B, exec, zen-twilight"
    "SUPER, J, layoutmsg, togglesplit"

    # Move focus
    "SUPER, left, movefocus, l"
    "SUPER, right, movefocus, r"
    "SUPER, up, movefocus, u"
    "SUPER, down, movefocus, d"
    "SUPER, l, movefocus, l"
    "SUPER, h, movefocus, r"
    "SUPER, k, movefocus, u"
    "SUPER, j, movefocus, d"

    # Switch workspaces
    "SUPER, 1, workspace, 1"
    "SUPER, 2, workspace, 2"
    "SUPER, 3, workspace, 3"
    "SUPER, 4, workspace, 4"
    "SUPER, 5, workspace, 5"

    # Move active window to workspace
    "SUPER SHIFT, 1, movetoworkspace, 1"
    "SUPER SHIFT, 2, movetoworkspace, 2"
    "SUPER SHIFT, 3, movetoworkspace, 3"
    "SUPER SHIFT, 4, movetoworkspace, 4"
    "SUPER SHIFT, 5, movetoworkspace, 5"

    # awww wallpaper switch
    "SUPER SHIFT, W, exec, bash $HOME/.config/hypr/scripts/awww-wallpaper-switch.sh"
  ];

  bindm = [
    "SUPER, mouse:272, movewindow"
    "SUPER, mouse:273, resizewindow"
  ];
}
