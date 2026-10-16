let
  flake = builtins.getFlake ("path:" + toString ../../..);
  pkgs = flake.inputs.nixpkgs.legacyPackages.${builtins.currentSystem};
  inherit (pkgs) lib;
  inherit (import ./desktop-theme-scenario.nix { inherit pkgs; })
    scenario
    modeApplied
    matugenEvents
    passOrThrow
    ;

  toggles = scenario "toggles" ''
    for compositor in Hyprland niri; do
      rm -f "$mode_file"
      XDG_CURRENT_DESKTOP="$compositor" run "$compositor-light" toggle
      XDG_CURRENT_DESKTOP="$compositor" run "$compositor-dark" toggle
    done
  '';

  savedModes = scenario "saved-modes" ''
    run default-apply apply
    run set-light light
    XDG_CURRENT_DESKTOP=Hyprland run saved-light-apply apply
  '';

  wallpapers = scenario "wallpapers" ''
    mkdir -p "$(dirname "$wallpaper_cache")"
    echo image > "$HOME/image with spaces.png"
    echo "$HOME/image with spaces.png" > "$wallpaper_cache"
    run cached light
    echo image > "$HOME/new wallpaper.png"
    run explicit apply "$HOME/new wallpaper.png"
    echo "$HOME/deleted.png" > "$wallpaper_cache"
    run deleted light
  '';

  concurrentToggles = scenario "concurrent-toggles" ''
    export THEME_TEST_DELAY=0.2
    bash "$theme_script" toggle & first=$!
    bash "$theme_script" toggle & second=$!
    status=0
    wait "$first" || status=$?
    wait "$second" || status=$?
    snapshot both "$status"
  '';

  imageEvent = path: "matugen <image> <~/${path}> <--mode> <light> <--source-color-index> <0>";
  lastArguments = run: map (event: lib.last (lib.splitString " " event)) (matugenEvents run);
in
passOrThrow "desktop-theme modes" {
  toggleRoundTripInHyprland =
    modeApplied "light" (toggles "Hyprland-light") && modeApplied "dark" (toggles "Hyprland-dark");
  toggleRoundTripInNiri =
    modeApplied "light" (toggles "niri-light") && modeApplied "dark" (toggles "niri-dark");
  applyDefaultsToDark = modeApplied "dark" (savedModes "default-apply");
  applyPreservesSavedLight = modeApplied "light" (savedModes "saved-light-apply");
  cachedWallpaperWithSpacesIsUsedUnchanged =
    modeApplied "light" (wallpapers "cached")
    && (wallpapers "cached").cache == "~/image with spaces.png"
    && builtins.elem (imageEvent "image with spaces.png") (wallpapers "cached").events;
  explicitWallpaperPreservesLight =
    modeApplied "light" (wallpapers "explicit")
    && builtins.elem (imageEvent "new wallpaper.png") (wallpapers "explicit").events;
  deletedWallpaperUsesFallbackColor = builtins.elem "matugen <color> <hex> <#89b4fa> <--mode> <light>" (wallpapers "deleted")
  .events;
  simultaneousTogglesAreSerialized =
    (concurrentToggles "both").status == 0
    && (concurrentToggles "both").mode == "dark"
    &&
      lastArguments (concurrentToggles "both") == [
        "<light>"
        "<dark>"
      ];
}
