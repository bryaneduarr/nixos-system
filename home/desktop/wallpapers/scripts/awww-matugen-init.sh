#!/usr/bin/env bash
set -uo pipefail

WALLPAPER_DIR="$HOME/wallpapers"
CACHE_FILE="$HOME/.cache/matugen/last-wallpaper"
LOG_FILE="$HOME/.cache/matugen/init.log"
STATE_FILE="$HOME/.cache/matugen/init-state"

log() {
    mkdir -p "$HOME/.cache/matugen"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"
}

log "=== awww-matugen-init start ==="
log "WAYLAND_DISPLAY=$WAYLAND_DISPLAY"

WALLPAPER=""
if [ -f "$CACHE_FILE" ]; then
    WALLPAPER=$(cat "$CACHE_FILE")
fi

if [ ! -f "${WALLPAPER:-}" ]; then
    mkdir -p "$WALLPAPER_DIR"
    WALLPAPER=$(find "$WALLPAPER_DIR" -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" -o -iname "*.webp" \) 2>/dev/null | shuf -n 1)
fi

if [ -z "${WALLPAPER:-}" ] || [ ! -f "${WALLPAPER:-}" ]; then
    log "No wallpaper, applying theme without an image"
    desktop-theme apply >> "$LOG_FILE" 2>&1 &
    exit 0
fi

# Aggressive polling: daemon restarts instantly (RestartSec=0).
# Each failed awww img returns immediately (connection refused).
# As soon as Wayland is up, the daemon connects and we succeed.
log "Pinging awww daemon..."
for i in $(seq 1 200); do
    if timeout 2 awww img "$WALLPAPER" 2>/dev/null; then
        log "Wallpaper set after ~$((i * 50))ms"
        break
    fi
    sleep 0.05
done
log "Wallpaper: $WALLPAPER"

mkdir -p "$(dirname "$CACHE_FILE")"
echo "$WALLPAPER" > "$CACHE_FILE"

desktop-theme apply "$WALLPAPER" >> "$LOG_FILE" 2>&1 &

echo "init_done=yes" > "$STATE_FILE"
echo "last_wallpaper=$WALLPAPER" >> "$STATE_FILE"
date +%s > "$HOME/.cache/matugen/init-timestamp"
log "=== awww-matugen-init complete ==="
