#!/usr/bin/env bash
set -euo pipefail

STATE_DIRECTORY="${XDG_STATE_HOME:-$HOME/.local/state}/desktop-theme"
MODE_FILE="$STATE_DIRECTORY/mode"
CONFIG_DIRECTORY="${XDG_CONFIG_HOME:-$HOME/.config}"
WALLPAPER_CACHE="${XDG_CACHE_HOME:-$HOME/.cache}/matugen/last-wallpaper"
ACTION="${1:-toggle}"
WALLPAPER="${2:-}"

case "$ACTION" in
    toggle|apply|light|dark) ;;
    *)
        echo "Usage: desktop-theme [toggle|apply|light|dark] [wallpaper]" >&2
        exit 2
        ;;
esac

mkdir -p "$STATE_DIRECTORY"
exec 9> "$STATE_DIRECTORY/lock"
flock 9

MODE="dark"
if [ -f "$MODE_FILE" ]; then
    read -r MODE < "$MODE_FILE" || true
fi

case "$MODE" in
    light|dark) ;;
    *) MODE="dark" ;;
esac

case "$ACTION" in
    toggle)
        if [ "$MODE" = "dark" ]; then
            MODE="light"
        else
            MODE="dark"
        fi
        ;;
    light|dark) MODE="$ACTION" ;;
esac

if [ -z "$WALLPAPER" ] && [ -f "$WALLPAPER_CACHE" ]; then
    read -r WALLPAPER < "$WALLPAPER_CACHE" || true
fi

if [ -f "$WALLPAPER" ]; then
    matugen image "$WALLPAPER" --mode "$MODE" --source-color-index 0
else
    matugen color hex '#89b4fa' --mode "$MODE"
fi

if [ "$MODE" = "dark" ]; then
    GTK_THEME="Adwaita-dark"
else
    GTK_THEME="Adwaita"
fi

gsettings set org.gnome.desktop.interface gtk-theme "$GTK_THEME"
gsettings set org.gnome.desktop.interface color-scheme "prefer-$MODE"

printf '%s\n' "$MODE" > "$MODE_FILE.tmp"
mv "$MODE_FILE.tmp" "$MODE_FILE"

for socket in /tmp/kitty-*; do
    if [ -S "$socket" ]; then
        kitty @ --to "unix:$socket" set-colors -a -c "$CONFIG_DIRECTORY/kitty/matugen.conf" 2>/dev/null || true
    fi
done

pkill -u "$(id -u)" -USR2 -x waybar || true
printf 'Desktop theme: %s\n' "$MODE"
