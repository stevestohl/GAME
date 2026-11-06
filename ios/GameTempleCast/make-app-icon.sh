#!/bin/sh
# Renders AppIcon.svg to the 1024x1024 PNG in the app's asset catalog, using headless Chrome.
# The PNG is flattened to have no alpha channel, which the App Store requires.
set -e
cd "$(dirname "$0")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT="GameTempleCast/Assets.xcassets/AppIcon.appiconset/AppIcon.png"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

"$CHROME" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --window-size=1024,1024 --screenshot="$TMP/icon.png" "file://$PWD/AppIcon.svg" >/dev/null 2>&1

# PNG -> JPEG -> PNG drops the alpha channel
sips -s format jpeg -s formatOptions best "$TMP/icon.png" --out "$TMP/icon.jpg" >/dev/null
sips -s format png "$TMP/icon.jpg" --out "$OUT" >/dev/null
echo "Wrote $OUT"
