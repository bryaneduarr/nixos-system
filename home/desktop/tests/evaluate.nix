let
  flake = builtins.getFlake ("path:" + toString ../../..);
  inherit (flake.inputs.nixpkgs) lib;
  system = flake.nixosConfigurations.nixos;

  selectCompositor =
    compositor:
    (system.extendModules {
      modules = [
        { desktop.compositor = lib.mkForce compositor; }
      ];
    }).config;

  checkCompositor =
    compositor:
    let
      config = selectCompositor compositor;
      home = config.home-manager.users.bryaneduarr;
      hyprlandEnabled = compositor == "hyprland";
      otherCompositor = if hyprlandEnabled then "niri" else "hyprland";
      configFiles = home.xdg.configFile;
      bar = home.programs.waybar.settings.mainBar;
      portals = config.xdg.portal.config.${compositor};
      wallpapers = home.systemd.user.services.awww-daemon;
      installedPackages = config.environment.systemPackages ++ home.home.packages;
      packageNames = map (package: package.pname or package.name) installedPackages;
      sessions = lib.concatMap (
        package: package.passthru.providedSessions
      ) config.services.displayManager.sessionPackages;
      expectedSessions =
        if hyprlandEnabled then
          [
            "hyprland"
            "hyprland-uwsm"
          ]
        else
          [ "niri" ];
    in
    assert config.programs.hyprland.enable == hyprlandEnabled;
    assert config.programs.niri.enable == !hyprlandEnabled;
    assert home.wayland.windowManager.hyprland.enable == hyprlandEnabled;
    assert sessions == expectedSessions;
    assert !(builtins.elem otherCompositor packageNames);
    assert builtins.hasAttr "hypr/hyprland.conf" configFiles == hyprlandEnabled;
    assert builtins.hasAttr "niri/config.kdl" configFiles == !hyprlandEnabled;
    assert builtins.hasAttr "${compositor}-mimeapps.list" configFiles;
    assert !(builtins.hasAttr "${otherCompositor}-mimeapps.list" configFiles);
    assert !(builtins.hasAttr otherCompositor config.xdg.portal.config);
    assert home.home.sessionVariables.BROWSER == "zen-twilight";
    assert home.home.sessionVariables.NIXOS_OZONE_WL == "1";
    assert !home.xdg.mimeApps.enable;
    assert config.xdg.portal.xdgOpenUsePortal;
    assert portals."org.freedesktop.impl.portal.AppChooser" == "gtk";
    assert portals."org.freedesktop.impl.portal.FileChooser" == "gtk";
    assert portals.default == (if hyprlandEnabled then "hyprland;gtk" else "gnome;gtk");
    assert
      bar.modules-left == [
        "${compositor}/workspaces"
        "${compositor}/window"
      ];
    assert !(builtins.hasAttr "${otherCompositor}/workspaces" bar);
    assert !(builtins.hasAttr "${otherCompositor}/window" bar);
    assert home.programs.waybar.systemd.enable;
    assert home.programs.waybar.systemd.targets == [ "graphical-session.target" ];
    assert wallpapers.Install.WantedBy == [ "graphical-session.target" ];
    assert wallpapers.Unit.PartOf == [ "graphical-session.target" ];
    assert configFiles."wallpapers/awww-matugen-init.sh".executable;
    assert configFiles."wallpapers/awww-wallpaper-switch.sh".executable;
    assert lib.all (assertion: assertion.assertion) config.assertions;
    assert lib.all (assertion: assertion.assertion) home.assertions;
    assert hyprlandEnabled || builtins.elem "xwayland-satellite" packageNames;
    {
      inherit compositor sessions;
      systemDerivation = config.system.build.toplevel.drvPath;
      homeDerivation = home.home.activationPackage.drvPath;
      wallpaperDaemon = wallpapers.Service.ExecStart;
      mimeDefaults = configFiles."${compositor}-mimeapps.list".text;
      niriConfig = if hyprlandEnabled then null else toString configFiles."niri/config.kdl".source;
    };

  conflictingConfig =
    (system.extendModules {
      modules = [
        {
          desktop.compositor = lib.mkForce "hyprland";
          programs.niri.enable = lib.mkForce true;
        }
      ];
    }).config;

  rejectsConflictingCompositors = lib.any (
    assertion: !assertion.assertion
  ) conflictingConfig.assertions;

  rejectsInvalidCompositor =
    !(builtins.tryEval (selectCompositor "invalid").desktop.compositor).success;
in
assert rejectsConflictingCompositors;
assert rejectsInvalidCompositor;
{
  hyprland = checkCompositor "hyprland";
  niri = checkCompositor "niri";
  inherit rejectsConflictingCompositors rejectsInvalidCompositor;
}
