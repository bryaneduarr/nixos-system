{
  "$mod" = "SUPER";

  bind = [
    "$mod, T, exec, kitty"
    "$mod, Q, killactive"
    "$mod, M, exit"
    "$mod, V, togglefloating"
    "$mod, R, exec, rofi -show drun"
    "$mod, P, pseudo"
    "$mod, J, togglesplit"

    # Move focus
    "$mod, left, movefocus, l"
    "$mod, right, movefocus, r"
    "$mod, up, movefocus, u"
    "$mod, down, movefocus, d"
    "$mod, l, movefocus, l"
    "$mod, h, movefocus, r"
    "$mod, k, movefocus, u"
    "$mod, j, movefocus, d"

    # Switch workspaces
    "$mod, 1, workspace, 1"
    "$mod, 2, workspace, 2"
    "$mod, 3, workspace, 3"
    "$mod, 4, workspace, 4"
    "$mod, 5, workspace, 5"

    # Move active window to workspace
    "$mod SHIFT, 1, movetoworkspace, 1"
    "$mod SHIFT, 2, movetoworkspace, 2"
    "$mod SHIFT, 3, movetoworkspace, 3"
    "$mod SHIFT, 4, movetoworkspace, 4"
    "$mod SHIFT, 5, movetoworkspace, 5"

    # awww wallpaper switch
    "$mod SHIFT, W, exec, bash $HOME/.config/hypr/scripts/awww-wallpaper-switch.sh"
  ];

  bindm = [
    "$mod, mouse:272, movewindow"
    "$mod, mouse:273, resizewindow"
  ];
}
