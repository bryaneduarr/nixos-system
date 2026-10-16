let
  flake = builtins.getFlake ("path:" + toString ../..);
  inherit (flake.inputs.nixpkgs) lib;
  appearance = import ../../system/desktop-session/appearance-constants.nix;
  windowGap = appearance.gaps.inner * 2;
  outerStrut = appearance.gaps.outer - windowGap;

  niri = flake.nixosConfigurations.nixos.config;
  niriHome = niri.home-manager.users.bryaneduarr;
  configText = niriHome.xdg.configFile."niri/config.kdl".source.configText;
  hasText = text: lib.hasInfix text configText;

  hyprland =
    (flake.nixosConfigurations.nixos.extendModules {
      modules = [ { custom.desktop-session.compositor = lib.mkForce "hyprland"; } ];
    }).config;

  packageNames =
    config:
    map (package: package.pname or package.name) (
      config.environment.systemPackages ++ config.home-manager.users.bryaneduarr.home.packages
    );
  niriOnlyPackages = [
    "brightnessctl"
    "orca"
    "playerctl"
    "swaylock"
  ];
in
assert niri.custom.desktop-session.compositor == "niri";
assert hasText ''Super+T hotkey-overlay-title="Open a Terminal: Kitty" { spawn "kitty"; }'';
assert hasText
  ''Super+Shift+D hotkey-overlay-title="Toggle light and dark mode" { spawn "desktop-theme" "toggle"; }'';
assert lib.all (workspace: hasText "Super+${workspace} { focus-workspace ${workspace}; }") (
  map toString (lib.range 1 9)
);
assert hasText "Super+Page_Up { focus-workspace-up; }";
assert hasText "Super+Page_Down { focus-workspace-down; }";
assert hasText "passes ${toString appearance.blur.passes}";
assert hasText "offset ${toString appearance.blur.size}";
assert hasText "geometry-corner-radius ${toString appearance.rounding}";
assert hasText ''
  window-rule {
      match app-id="^kitty$"

      background-effect {
          blur true
          xray false
      }
  }
'';
assert !(hasText "    opacity ");
assert niriHome.programs.kitty.settings.background_opacity == "0.90";
assert niriHome.programs.kitty.settings.dynamic_background_opacity;
assert hasText "gaps ${toString windowGap}";
assert lib.all (edge: hasText "${edge} ${toString outerStrut}") [
  "left"
  "right"
  "top"
  "bottom"
];
assert hasText "focus-ring {\n        off\n    }";
assert hasText "border {\n        off\n    }";
assert hasText "open-maximized-to-edges false";
assert lib.all (name: builtins.elem name (packageNames niri)) (
  niriOnlyPackages
  ++ [
    "wireplumber"
    "xwayland-satellite"
  ]
);
assert lib.all (name: !(builtins.elem name (packageNames hyprland))) niriOnlyPackages;
assert builtins.hasAttr "swaylock" niri.security.pam.services;
assert niri.services.gnome.at-spi2-core.enable;
assert !hyprland.services.gnome.at-spi2-core.enable;
assert lib.any (
  package: (package.pname or package.name) == "brightnessctl"
) niri.services.udev.packages;
true
