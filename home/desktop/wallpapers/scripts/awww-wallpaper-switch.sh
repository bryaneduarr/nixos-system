#!/usr/bin/env bash
set -uo pipefail

WALLPAPER_DIR="$HOME/wallpapers"
CACHE_FILE="$HOME/.cache/matugen/last-wallpaper"
LOG_FILE="$HOME/.cache/matugen/switch.log"

log() {
    mkdir -p "$HOME/.cache/matugen"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"
}

log "=== wallpaper-switch start ==="

mkdir -p "$WALLPAPER_DIR"

COUNT=$(find "$WALLPAPER_DIR" -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" -o -iname "*.webp" \) 2>/dev/null | wc -l)
if [ "$COUNT" -eq 0 ]; then
    log "No wallpapers found"
    echo "No wallpapers found in $WALLPAPER_DIR"
    exit 1
fi

WALLPAPER=$(find "$WALLPAPER_DIR" -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" -o -iname "*.webp" \) 2>/dev/null | shuf -n 1)
log "Selected: $WALLPAPER"

TRANSITIONS=("grow" "center" "any" "outer" "wave")
RANDOM_TRANSITION=${TRANSITIONS[$RANDOM % ${#TRANSITIONS[@]}]}

log "Setting wallpaper..."
AWWW_OK=false
for _ in $(seq 1 10); do
    if timeout 3 awww img "$WALLPAPER" --transition-type "$RANDOM_TRANSITION" \
        --transition-fps 280 --transition-step 255 --transition-duration 1 2>/dev/null; then
        AWWW_OK=true
        break
    fi
    sleep 0.2
done

if [ "$AWWW_OK" = false ]; then
    log "Transition failed, trying plain..."
    for _ in $(seq 1 10); do
        if timeout 2 awww img "$WALLPAPER" 2>/dev/null; then
            AWWW_OK=true
            break
        fi
        sleep 0.2
    done
fi

log "awww_ok=$AWWW_OK"

mkdir -p "$(dirname "$CACHE_FILE")"
echo "$WALLPAPER" > "$CACHE_FILE"

desktop-theme apply "$WALLPAPER" >> "$LOG_FILE" 2>&1 &

echo "Wallpaper switched successfully"
log "=== wallpaper-switch complete ==="
