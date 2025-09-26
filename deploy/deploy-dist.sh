#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   bash deploy-dist.sh <dist-zip-or-dir> <web-root>
# Examples:
#   bash deploy-dist.sh ./dist /var/www/supply
#   bash deploy-dist.sh /tmp/dist.zip /var/www/supply

SRC="${1:-}"
DEST="${2:-/var/www/supply}"

if [[ -z "$SRC" ]]; then
  echo "Usage: bash deploy-dist.sh <dist-zip-or-dir> <web-root>" && exit 1
fi

TMP=""
cleanup() { [[ -n "$TMP" && -d "$TMP" ]] && rm -rf "$TMP"; }
trap cleanup EXIT

if [[ -f "$SRC" && "$SRC" == *.zip ]]; then
  echo "Unzipping $SRC ..."
  TMP=$(mktemp -d)
  unzip -q "$SRC" -d "$TMP"
  SRC_DIR="$TMP"
elif [[ -d "$SRC" ]]; then
  SRC_DIR="$SRC"
else
  echo "Error: $SRC not found (zip or directory)." && exit 1
fi

echo "Deploying $SRC -> $DEST"
sudo mkdir -p "$DEST"
sudo rsync -a --delete "$SRC_DIR"/ "$DEST"/
sudo find "$DEST" -type f -name ".DS_Store" -delete || true
echo "Deployed."


