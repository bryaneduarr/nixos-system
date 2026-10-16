let
  flake = builtins.getFlake ("path:" + toString ../../..);
  pkgs = flake.inputs.nixpkgs.legacyPackages.${builtins.currentSystem};
  inherit (pkgs) lib;

  compositors = [
    "Hyprland"
    "niri"
  ];

  stubCommand = pkgs.writeShellScript "wallpaper-test-stub" ''
    printf '%s%s\n' "''${0##*/}" "$(printf ' <%s>' "$@")" >> "$WALLPAPER_TEST_EVENTS"
  '';

  scenario =
    name: steps:
    let
      result = pkgs.runCommand "wallpaper-scripts-${name}" { } ''
        export HOME="$TMPDIR/home"
        export PATH="$HOME/bin:$PATH"
        export WAYLAND_DISPLAY=wayland-test
        export WALLPAPER_TEST_EVENTS="$HOME/events"
        cache="$HOME/.cache/matugen/last-wallpaper"
        wallpaper="$HOME/wallpapers/wallpaper with spaces.png"
        mkdir -p "$HOME/bin" "$out"
        for command in awww desktop-theme; do
          ln -s ${stubCommand} "$HOME/bin/$command"
        done
        touch "$WALLPAPER_TEST_EVENTS"

        add_wallpaper() {
          mkdir -p "$HOME/wallpapers"
          echo image > "$wallpaper"
        }

        run() {
          local label="$1"
          local status=0
          mkdir "$out/$label"
          bash "${./scripts}/$2" > "$out/$label/output" || status=$?
          echo "$status" > "$out/$label/status"
          if [ "$status" -eq 0 ]; then
            for _ in $(seq 1 500); do
              grep -q '^desktop-theme <apply>' "$WALLPAPER_TEST_EVENTS" && break
              sleep 0.01
            done
          fi
          sed "s|$HOME|~|g" "$cache" > "$out/$label/cache" 2>/dev/null || echo missing > "$out/$label/cache"
          sed "s|$HOME|~|g" "$WALLPAPER_TEST_EVENTS" > "$out/$label/events"
          : > "$WALLPAPER_TEST_EVENTS"
        }

        ${steps}
      '';
    in
    label:
    let
      read = file: lib.trim (builtins.readFile "${result}/${label}/${file}");
    in
    {
      status = lib.toInt (read "status");
      output = read "output";
      cache = read "cache";
      events = read "events";
    };

  wallpaperApplied =
    run:
    run.status == 0
    && run.cache == "~/wallpapers/wallpaper with spaces.png"
    && lib.hasInfix "awww <img> <~/wallpapers/wallpaper with spaces.png>" run.events
    && lib.hasInfix "desktop-theme <apply> <~/wallpapers/wallpaper with spaces.png>" run.events;

  eachCompositor =
    name: steps:
    scenario name ''
      for compositor in ${lib.concatStringsSep " " compositors}; do
        export XDG_CURRENT_DESKTOP="$compositor"
        ${steps}
      done
    '';

  firstLogin = eachCompositor "firstLogin" ''
    add_wallpaper
    rm -f "$cache"
    run "$compositor" awww-matugen-init.sh
  '';

  cachedLogin = eachCompositor "cachedLogin" ''
    add_wallpaper
    mkdir -p "$(dirname "$cache")"
    echo "$wallpaper" > "$cache"
    run "$compositor" awww-matugen-init.sh
  '';

  deletedCacheLogin = eachCompositor "deletedCacheLogin" ''
    add_wallpaper
    mkdir -p "$(dirname "$cache")"
    echo "$HOME/deleted.png" > "$cache"
    run "$compositor" awww-matugen-init.sh
  '';

  switch = eachCompositor "switch" ''
    add_wallpaper
    run "$compositor" awww-wallpaper-switch.sh
  '';

  emptyDirectory = eachCompositor "emptyDirectory" ''
    run "$compositor-init" awww-matugen-init.sh
    run "$compositor-switch" awww-wallpaper-switch.sh
  '';

  checksFor = compositor: {
    "firstLoginAppliesWallpaperIn${compositor}" = wallpaperApplied (firstLogin compositor);
    "cachedWallpaperSurvivesSwitchTo${compositor}" = wallpaperApplied (cachedLogin compositor);
    "deletedCacheFallsBackToImageIn${compositor}" = wallpaperApplied (deletedCacheLogin compositor);
    "switchUpdatesWallpaperAndThemeIn${compositor}" =
      wallpaperApplied (switch compositor)
      && lib.hasInfix "<--transition-type>" (switch compositor).events;
    "emptyDirectoryDoesNotBlockLoginIn${compositor}" =
      let
        run = emptyDirectory "${compositor}-init";
      in
      run.status == 0 && lib.hasInfix "desktop-theme <apply>" run.events && run.cache == "missing";
    "emptyDirectoryReportsNoWallpaperIn${compositor}" =
      let
        run = emptyDirectory "${compositor}-switch";
      in
      run.status == 1 && lib.hasInfix "No wallpapers found" run.output && run.events == "";
  };

  checks = lib.mergeAttrsList (map checksFor compositors);
  failed = lib.attrNames (lib.filterAttrs (_: passed: !passed) checks);
in
if failed == [ ] then
  lib.attrNames checks
else
  throw "wallpaper script checks failed: ${lib.concatStringsSep ", " failed}"
