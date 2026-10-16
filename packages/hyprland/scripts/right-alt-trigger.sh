#!/usr/bin/env bash
echo "[$(date)] Right ALT triggered" >> /tmp/hypr-right-alt.log
notify-send "Right ALT" "Triggering Ctrl+B"
wtype -M ctrl b -m ctrl
