#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -f .env.production ]; then
  echo ".env.production not found."
  echo "Run first-time setup with: kasa install prod"
  exit 1
fi

echo "Starting CodeWithKasa production stack..."
docker compose --env-file .env.production -f docker-compose.prod.yml up -d

echo ""
echo "CodeWithKasa production stack is running."
