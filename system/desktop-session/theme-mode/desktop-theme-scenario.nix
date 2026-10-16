{ pkgs }:
let
  inherit (pkgs) lib;

  stubCommand = pkgs.writeShellScript "desktop-theme-test-stub" ''
    command="''${0##*/}"
    {
      printf '%s' "$command"
      printf ' <%s>' "$@"
      printf '\n'
    } >> "$THEME_TEST_EVENTS"
    if [ "$command" = matugen ]; then
      sleep "''${THEME_TEST_DELAY:-0}"
    fi
    failure_variable="THEME_TEST_FAIL_$command"
    exit "''${!failure_variable:-0}"
  '';

  scenario =
    name: steps:
    let
      result = pkgs.runCommand "desktop-theme-${name}" { nativeBuildInputs = [ pkgs.util-linux ]; } ''
        export HOME="$TMPDIR/home"
        export PATH="$HOME/bin:$PATH"
        export THEME_TEST_EVENTS="$HOME/events"
        export XDG_STATE_HOME="$HOME/.local/state" XDG_CACHE_HOME="$HOME/.cache" XDG_CONFIG_HOME="$HOME/.config"
        export XDG_CURRENT_DESKTOP=niri
        theme_script=${./desktop-theme.sh}
        mode_file="$XDG_STATE_HOME/desktop-theme/mode"
        wallpaper_cache="$XDG_CACHE_HOME/matugen/last-wallpaper"
        mkdir -p "$HOME/bin" "$out"
        for command in gsettings matugen kitty pkill; do
          ln -s ${stubCommand} "$HOME/bin/$command"
        done
        touch "$THEME_TEST_EVENTS"

        snapshot() {
          mkdir "$out/$1"
          echo "$2" > "$out/$1/status"
          cat "$mode_file" > "$out/$1/mode" 2>/dev/null || echo missing > "$out/$1/mode"
          sed "s|$HOME|~|g" "$wallpaper_cache" > "$out/$1/cache" 2>/dev/null || echo missing > "$out/$1/cache"
          sed "s|$HOME|~|g" "$THEME_TEST_EVENTS" > "$out/$1/events"
          : > "$THEME_TEST_EVENTS"
        }

        run() {
          local label="$1"
          local status=0
          shift
          bash "$theme_script" "$@" || status=$?
          snapshot "$label" "$status"
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
      mode = read "mode";
      cache = read "cache";
      events = lib.filter (line: line != "") (lib.splitString "\n" (read "events"));
    };

  matugenEvents = run: lib.filter (lib.hasPrefix "matugen ") run.events;

  modeApplied =
    mode: run:
    let
      gtkTheme = if mode == "dark" then "Adwaita-dark" else "Adwaita";
    in
    run.status == 0
    && run.mode == mode
    && builtins.elem "gsettings <set> <org.gnome.desktop.interface> <gtk-theme> <${gtkTheme}>" run.events
    && builtins.elem "gsettings <set> <org.gnome.desktop.interface> <color-scheme> <prefer-${mode}>" run.events
    && lib.hasInfix "<--mode> <${mode}>" (lib.last (matugenEvents run));
in
{
  inherit scenario modeApplied matugenEvents;

  passOrThrow =
    subject: checks:
    let
      failed = lib.attrNames (lib.filterAttrs (_: passed: !passed) checks);
    in
    if failed == [ ] then
      lib.attrNames checks
    else
      throw "${subject} checks failed: ${lib.concatStringsSep ", " failed}";
}
