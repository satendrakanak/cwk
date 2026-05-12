#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -f .env ]; then
  exit 0
fi

echo "Stopping CodeWithKasa production stack..."
docker compose --env-file .env -f docker-compose.prod.yml down --remove-orphans
