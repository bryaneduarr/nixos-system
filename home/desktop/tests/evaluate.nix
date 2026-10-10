let
  flake = builtins.getFlake ("path:" + toString ../../..);
  inherit (flake.inputs.nixpkgs) lib;
  system = flake.nixosConfigurations.nixos;
  appearance = import ../appearance-constants.nix;

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
      fontDefaults = config.fonts.fontconfig.defaultFonts;
      interfaceFonts = home.dconf.settings."org/gnome/desktop/interface";
      desktopFont = "${appearance.fonts.default} ${toString appearance.fonts.size}";
      fontPackages = map (package: package.pname or package.name) config.fonts.packages;
      portals = config.xdg.portal.config.${compositor};
      wallpapers = home.systemd.user.services.awww-daemon;
      niriConfigText = if hyprlandEnabled then "" else configFiles."niri/config.kdl".source.configText;
      niriWindowGap = appearance.gaps.inner * 2;
      niriOuterStrut = appearance.gaps.outer - niriWindowGap;
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
    assert !hyprlandEnabled || configFiles."hypr/hyprland.conf".force;
    assert !hyprlandEnabled || home.home.file."${home.xdg.configHome}/hypr/hyprland.conf".force;
    assert
      !hyprlandEnabled
      || builtins.elem "linkGeneration" home.home.activation.backupUnmanagedHyprlandConfig.before;
    assert
      !hyprlandEnabled
      || builtins.elem "writeBoundary" home.home.activation.backupUnmanagedHyprlandConfig.after;
    assert
      hyprlandEnabled
      || lib.hasInfix ''Super+T hotkey-overlay-title="Open a Terminal: Kitty" { spawn "kitty"; }'' niriConfigText;
    assert
      hyprlandEnabled
      ||
        lib.all
          (workspace: lib.hasInfix "Super+${workspace} { focus-workspace ${workspace}; }" niriConfigText)
          [
            "1"
            "2"
            "3"
            "4"
            "5"
            "6"
            "7"
            "8"
            "9"
          ];
    assert hyprlandEnabled || lib.hasInfix "Super+Page_Up { focus-workspace-up; }" niriConfigText;
    assert hyprlandEnabled || lib.hasInfix "Super+Page_Down { focus-workspace-down; }" niriConfigText;
    assert builtins.elem "desktop-theme" packageNames;
    assert home.dconf.enable;
    assert builtins.elem "figtree" fontPackages;
    assert builtins.elem "nerd-fonts-jetbrains-mono" fontPackages;
    assert fontDefaults.sansSerif == [ "Figtree" ];
    assert fontDefaults.serif == [ "Figtree" ];
    assert fontDefaults.monospace == [ "JetBrains Mono Nerd Font" ];
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
    assert interfaceFonts.font-name == desktopFont;
    assert interfaceFonts.document-font-name == desktopFont;
    assert
      interfaceFonts.monospace-font-name
      == "${appearance.fonts.monospace} ${toString appearance.fonts.size}";
    assert
      home.dconf.settings."org/gnome/desktop/wm/preferences".titlebar-font
      == "${appearance.fonts.default} Bold ${toString appearance.fonts.size}";
    assert !(builtins.hasAttr "gtk-theme" interfaceFonts);
    assert !(builtins.hasAttr "color-scheme" interfaceFonts);
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
    assert
      !hyprlandEnabled
      || builtins.elem "SUPER SHIFT, D, exec, desktop-theme toggle" home.wayland.windowManager.hyprland.settings.bind;
    assert
      hyprlandEnabled
      || lib.hasInfix ''Super+Shift+D hotkey-overlay-title="Toggle light and dark mode" { spawn "desktop-theme" "toggle"; }'' niriConfigText;
    assert home.programs.kitty.settings.background_opacity == "0.90";
    assert home.programs.kitty.settings.dynamic_background_opacity;
    assert hyprlandEnabled || lib.hasInfix "passes ${toString appearance.blur.passes}" niriConfigText;
    assert hyprlandEnabled || lib.hasInfix "offset ${toString appearance.blur.size}" niriConfigText;
    assert
      hyprlandEnabled
      || lib.hasInfix "geometry-corner-radius ${toString appearance.rounding}" niriConfigText;
    assert
      hyprlandEnabled
      || lib.hasInfix ''
        window-rule {
            match app-id="^kitty$"

            background-effect {
                blur true
                xray false
            }
        }
      '' niriConfigText;
    assert hyprlandEnabled || !(lib.hasInfix "    opacity " niriConfigText);
    assert hyprlandEnabled || lib.hasInfix "gaps ${toString niriWindowGap}" niriConfigText;
    assert
      hyprlandEnabled
      || lib.all (edge: lib.hasInfix "${edge} ${toString niriOuterStrut}" niriConfigText) [
        "left"
        "right"
        "top"
        "bottom"
      ];
    assert hyprlandEnabled || lib.hasInfix "focus-ring {\n        off\n    }" niriConfigText;
    assert hyprlandEnabled || lib.hasInfix "border {\n        off\n    }" niriConfigText;
    assert hyprlandEnabled || lib.hasInfix "open-maximized-to-edges false" niriConfigText;
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
    assert home.programs.waybar.enable == hyprlandEnabled;
    assert home.programs.waybar.systemd.enable == hyprlandEnabled;
    assert home.programs.waybar.systemd.targets == [ "graphical-session.target" ];
    assert builtins.hasAttr "waybar" home.systemd.user.services == hyprlandEnabled;
    assert builtins.hasAttr "waybar/config" configFiles == hyprlandEnabled;
    assert builtins.hasAttr "waybar/style.css" configFiles == hyprlandEnabled;
    assert builtins.hasAttr "systemd/user/waybar.service" configFiles == hyprlandEnabled;
    assert builtins.elem "waybar" packageNames == hyprlandEnabled;
    assert wallpapers.Install.WantedBy == [ "graphical-session.target" ];
    assert wallpapers.Unit.PartOf == [ "graphical-session.target" ];
    assert configFiles."wallpapers/awww-matugen-init.sh".executable;
    assert configFiles."wallpapers/awww-wallpaper-switch.sh".executable;
    assert lib.all (assertion: assertion.assertion) config.assertions;
    assert lib.all (assertion: assertion.assertion) home.assertions;
    assert hyprlandEnabled || builtins.elem "xwayland-satellite" packageNames;
    assert
      hyprlandEnabled
      || lib.all (name: builtins.elem name packageNames) [
        "brightnessctl"
        "orca"
        "playerctl"
        "swaylock"
        "wireplumber"
      ];
    assert hyprlandEnabled || builtins.hasAttr "swaylock" config.security.pam.services;
    assert lib.all (name: builtins.elem name packageNames == !hyprlandEnabled) [
      "brightnessctl"
      "orca"
      "playerctl"
      "swaylock"
    ];
    assert config.services.gnome.at-spi2-core.enable == !hyprlandEnabled;
    assert
      hyprlandEnabled
      || lib.any (
        package: (package.pname or package.name) == "brightnessctl"
      ) config.services.udev.packages;
    {
      inherit compositor sessions;
      fonts = {
        inherit fontDefaults;
        gtk = home.gtk.font;
        rofi = home.programs.rofi.settings.font;
        kitty = home.programs.kitty.font;
        qtPlatformTheme = home.qt.platformTheme.name;
      };
      themeCommand = toString (
        lib.findFirst (package: package.name == "desktop-theme") null home.home.packages
      );
      systemDerivation = config.system.build.toplevel.drvPath;
      homeDerivation = home.home.activationPackage.drvPath;
      wallpaperDaemon = wallpapers.Service.ExecStart;
      mimeDefaults = configFiles."${compositor}-mimeapps.list".text;
      niriConfig = if hyprlandEnabled then null else toString configFiles."niri/config.kdl".source;
      niriConfigDerivation =
        if hyprlandEnabled then null else configFiles."niri/config.kdl".source.drvPath;
      niriSourceDerivation = if hyprlandEnabled then null else config.programs.niri.package.src.drvPath;
      niriDefaultConfig =
        if hyprlandEnabled then
          null
        else
          "${config.programs.niri.package.src}/resources/default-config.kdl";
      hyprlandBackupScript =
        if hyprlandEnabled then home.home.activation.backupUnmanagedHyprlandConfig.data else null;
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
