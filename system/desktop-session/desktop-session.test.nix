let
  flake = builtins.getFlake ("path:" + toString ../..);
  inherit (flake.inputs.nixpkgs) lib;
  system = flake.nixosConfigurations.nixos;
  appearance = import ./appearance-constants.nix;
  desktopFont = "${appearance.fonts.default} ${toString appearance.fonts.size}";

  extend = modules: (system.extendModules { inherit modules; }).config;
  selectCompositor =
    compositor: extend [ { custom.desktop-session.compositor = lib.mkForce compositor; } ];

  checkCompositor =
    compositor:
    let
      config = selectCompositor compositor;
      home = config.home-manager.users.bryaneduarr;
      hyprlandEnabled = compositor == "hyprland";
      otherCompositor = if hyprlandEnabled then "niri" else "hyprland";
      configFiles = home.xdg.configFile;
      portals = config.xdg.portal.config.${compositor};
      packageNames = map (package: package.pname or package.name) (
        config.environment.systemPackages ++ home.home.packages
      );
      sessions = lib.concatMap (
        package: package.passthru.providedSessions
      ) config.services.displayManager.sessionPackages;
    in
    assert config.programs.hyprland.enable == hyprlandEnabled;
    assert config.programs.niri.enable == !hyprlandEnabled;
    assert home.wayland.windowManager.hyprland.enable == hyprlandEnabled;
    assert builtins.hasAttr "hypr/hyprland.conf" configFiles == hyprlandEnabled;
    assert builtins.hasAttr "niri/config.kdl" configFiles == !hyprlandEnabled;
    assert
      sessions == (
        if hyprlandEnabled then
          [
            "hyprland"
            "hyprland-uwsm"
          ]
        else
          [ "niri" ]
      );
    assert !(builtins.elem otherCompositor packageNames);
    assert builtins.elem "desktop-theme" packageNames;
    assert builtins.hasAttr "${compositor}-mimeapps.list" configFiles;
    assert !(builtins.hasAttr "${otherCompositor}-mimeapps.list" configFiles);
    assert !(builtins.hasAttr otherCompositor config.xdg.portal.config);
    assert config.xdg.portal.xdgOpenUsePortal;
    assert portals."org.freedesktop.impl.portal.AppChooser" == "gtk";
    assert portals."org.freedesktop.impl.portal.FileChooser" == "gtk";
    assert portals.default == (if hyprlandEnabled then "hyprland;gtk" else "gnome;gtk");
    assert home.home.sessionVariables.BROWSER == "zen-twilight";
    assert home.home.sessionVariables.NIXOS_OZONE_WL == "1";
    assert !home.xdg.mimeApps.enable;
    assert lib.all (assertion: assertion.assertion) config.assertions;
    assert lib.all (assertion: assertion.assertion) home.assertions;
    {
      system = config.system.build.toplevel.drvPath;
      home = home.home.activationPackage.drvPath;
    };

  appearanceConfig =
    let
      inherit (system) config;
      home = config.home-manager.users.bryaneduarr;
      configFiles = home.xdg.configFile;
      fontDefaults = config.fonts.fontconfig.defaultFonts;
      fontPackages = map (package: package.pname or package.name) config.fonts.packages;
      interface = home.dconf.settings."org/gnome/desktop/interface";
      wallpapers = home.systemd.user.services.awww-daemon;
    in
    assert builtins.elem "figtree" fontPackages;
    assert builtins.elem "nerd-fonts-jetbrains-mono" fontPackages;
    assert fontDefaults.sansSerif == [ "Figtree" ];
    assert fontDefaults.serif == [ "Figtree" ];
    assert fontDefaults.monospace == [ "JetBrains Mono Nerd Font" ];
    assert home.dconf.enable;
    assert home.gtk.enable;
    assert home.gtk.font.name == "Figtree";
    assert home.gtk.font.size == appearance.fonts.size;
    assert lib.all
      (
        version:
        lib.hasInfix "gtk-font-name=${desktopFont}" configFiles."gtk-${version}.0/settings.ini".text
      )
      [
        "3"
        "4"
      ];
    assert lib.hasInfix ''gtk-font-name = "${desktopFont}"''
      home.home.file.${home.gtk.gtk2.configLocation}.text;
    assert interface.font-name == desktopFont;
    assert interface.document-font-name == desktopFont;
    assert
      interface.monospace-font-name == "${appearance.fonts.monospace} ${toString appearance.fonts.size}";
    assert
      home.dconf.settings."org/gnome/desktop/wm/preferences".titlebar-font
      == "${appearance.fonts.default} Bold ${toString appearance.fonts.size}";
    assert !(builtins.hasAttr "gtk-theme" interface);
    assert !(builtins.hasAttr "color-scheme" interface);
    assert home.qt.enable;
    assert home.qt.platformTheme.name == "gtk3";
    assert home.home.sessionVariables.QT_QPA_PLATFORMTHEME == "gtk3";
    assert home.systemd.user.sessionVariables.QT_QPA_PLATFORMTHEME == "gtk3";
    assert home.programs.rofi.enable;
    assert home.programs.rofi.settings.font == desktopFont;
    assert lib.hasInfix ''font: "${desktopFont}";''
      home.home.file.${home.programs.rofi.configPath}.text;
    assert lib.hasInfix ''font-family: "Figtree", "JetBrains Mono Nerd Font", sans-serif;''
      home.programs.waybar.style;
    assert home.programs.kitty.font.name == "JetBrains Mono Nerd Font";
    assert home.programs.kitty.font.size == 12.0;
    assert wallpapers.Install.WantedBy == [ "graphical-session.target" ];
    assert wallpapers.Unit.PartOf == [ "graphical-session.target" ];
    assert configFiles."wallpapers/awww-matugen-init.sh".executable;
    assert configFiles."wallpapers/awww-wallpaper-switch.sh".executable;
    true;

  conflictingConfig = extend [
    {
      custom.desktop-session.compositor = lib.mkForce "hyprland";
      programs.niri.enable = lib.mkForce true;
    }
  ];
  rejectsConflictingCompositors = lib.any (
    assertion: !assertion.assertion
  ) conflictingConfig.assertions;
  rejectsInvalidCompositor =
    !(builtins.tryEval (selectCompositor "invalid").custom.desktop-session.compositor).success;
in
assert appearanceConfig;
assert rejectsConflictingCompositors;
assert rejectsInvalidCompositor;
{
  hyprland = checkCompositor "hyprland";
  niri = checkCompositor "niri";
}
