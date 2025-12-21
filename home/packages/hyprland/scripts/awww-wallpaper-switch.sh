#!/usr/bin/env bash

WALLPAPER_DIR="$HOME/wallpapers"

mkdir -p "$WALLPAPER_DIR"

if [ -z "$(ls -A "$WALLPAPER_DIR" 2>/dev/null)" ]; then
    echo "No wallpapers found in $WALLPAPER_DIR"
    exit 1
fi

# Get random wallpaper.
WALLPAPER=$(find "$WALLPAPER_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" -o -iname "*.webp" \) | shuf -n 1)

# Random transition effects.
TRANSITIONS=("grow" "center" "any" "outer" "wave")
RANDOM_TRANSITION=${TRANSITIONS[$RANDOM % ${#TRANSITIONS[@]}]}

# Set wallpaper with random transition.
awww img "$WALLPAPER" \
    --transition-type "$RANDOM_TRANSITION" \
    --transition-fps 280 \
    --transition-step 255 \
    --transition-duration 1

matugen image "$WALLPAPER"

# Reload colors in all open kitty instances.
for socket in /tmp/kitty-*; do
    [ -S "$socket" ] && kitty @ --to "unix:$socket" set-colors -a -c ~/.config/kitty/matugen.conf 2>/dev/null
done
