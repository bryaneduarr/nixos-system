let
  flake = builtins.getFlake ("path:" + toString ../../..);
  pkgs = flake.inputs.nixpkgs.legacyPackages.${builtins.currentSystem};
  inherit (pkgs) lib;
  inherit (import ./desktop-theme-scenario.nix { inherit pkgs; }) scenario modeApplied passOrThrow;

  failures = scenario "failures" ''
    run invalid-action invalid
    mkdir -p "$(dirname "$mode_file")"
    echo invalid > "$mode_file"
    run invalid-mode apply
    THEME_TEST_FAIL_matugen=1 run renderer-failure toggle
    THEME_TEST_FAIL_gsettings=1 run gsettings-failure toggle
    THEME_TEST_FAIL_pkill=1 run reload-failure toggle
  '';
in
passOrThrow "desktop-theme failures" {
  invalidActionChangesNothing =
    failures "invalid-action" == {
      status = 2;
      mode = "missing";
      cache = "missing";
      events = [ ];
    };
  invalidModeFileRecoversToDark = modeApplied "dark" (failures "invalid-mode");
  rendererFailureCommitsNothing =
    (failures "renderer-failure").status != 0
    && (failures "renderer-failure").mode == "dark"
    && map (lib.hasPrefix "matugen ") (failures "renderer-failure").events == [ true ];
  gsettingsFailureKeepsMode =
    (failures "gsettings-failure").status != 0 && (failures "gsettings-failure").mode == "dark";
  reloadFailureDoesNotFailToggle = modeApplied "light" (failures "reload-failure");
}
