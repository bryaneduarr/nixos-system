let
  flake = builtins.getFlake ("path:" + toString ../..);
  inherit (flake.inputs.nixpkgs) lib;

  checkCompositor =
    compositor:
    let
      inherit
        (flake.nixosConfigurations.nixos.extendModules {
          modules = [ { custom.desktop-session.compositor = lib.mkForce compositor; } ];
        })
        config
        ;
      home = config.home-manager.users.bryaneduarr;
      hyprlandEnabled = compositor == "hyprland";
      otherCompositor = if hyprlandEnabled then "niri" else "hyprland";
      waybar = home.programs.waybar;
      bar = waybar.settings.mainBar;
      configFiles = home.xdg.configFile;
      packageNames = map (package: package.pname or package.name) (
        config.environment.systemPackages ++ home.home.packages
      );
    in
    assert
      bar.modules-left == [
        "${compositor}/workspaces"
        "${compositor}/window"
      ];
    assert !(builtins.hasAttr "${otherCompositor}/workspaces" bar);
    assert !(builtins.hasAttr "${otherCompositor}/window" bar);
    assert waybar.enable == hyprlandEnabled;
    assert waybar.systemd.enable == hyprlandEnabled;
    assert waybar.systemd.targets == [ "graphical-session.target" ];
    assert builtins.hasAttr "waybar" home.systemd.user.services == hyprlandEnabled;
    assert builtins.hasAttr "waybar/config" configFiles == hyprlandEnabled;
    assert builtins.hasAttr "waybar/style.css" configFiles == hyprlandEnabled;
    assert builtins.hasAttr "systemd/user/waybar.service" configFiles == hyprlandEnabled;
    assert builtins.elem "waybar" packageNames == hyprlandEnabled;
    true;
in
checkCompositor "hyprland" && checkCompositor "niri"
