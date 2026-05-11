#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -f .env.production.local ] && [ -f .env.production.local.example ]; then
  cp .env.production.local.example .env.production.local
fi

echo "Stopping CodeWithKasa production test stack..."
docker compose --env-file .env.production.local -f docker-compose.prod.yml down --remove-orphans
