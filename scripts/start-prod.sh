#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -f .env.production.local ]; then
  echo ".env.production.local not found."
  echo "Run first-time setup with: kasa install prod"
  exit 1
fi

echo "Starting CodeWithKasa production test stack..."
docker compose --env-file .env.production.local -f docker-compose.prod.yml up -d

echo ""
echo "CodeWithKasa production test stack is running."
echo "App:       http://localhost:3000"
echo "API:       http://localhost:8000"
