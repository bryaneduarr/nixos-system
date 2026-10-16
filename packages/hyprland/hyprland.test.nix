let
  flake = builtins.getFlake ("path:" + toString ../..);
  inherit (flake.inputs.nixpkgs) lib;
  inherit
    (flake.nixosConfigurations.nixos.extendModules {
      modules = [ { custom.desktop-session.compositor = lib.mkForce "hyprland"; } ];
    })
    config
    ;
  home = config.home-manager.users.bryaneduarr;
  backup = home.home.activation.backupUnmanagedHyprlandConfig;
in
assert home.xdg.configFile."hypr/hyprland.conf".force;
assert home.home.file."${home.xdg.configHome}/hypr/hyprland.conf".force;
assert builtins.elem "linkGeneration" backup.before;
assert builtins.elem "writeBoundary" backup.after;
assert builtins.elem "SUPER SHIFT, D, exec, desktop-theme toggle"
  home.wayland.windowManager.hyprland.settings.bind;
true
