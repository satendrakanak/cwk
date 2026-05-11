#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -f .env.development ]; then
  exit 0
fi

echo "Stopping CodeWithKasa development stack..."
docker compose --env-file .env.development down --remove-orphans
