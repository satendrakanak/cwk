#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -f .env ]; then
  echo ".env not found."
  echo "Run first-time setup with: kasa install prod"
  exit 1
fi

echo "Starting CodeWithKasa production stack..."
docker compose --env-file .env -f docker-compose.prod.yml up --no-build -d

echo ""
echo "CodeWithKasa production stack is running."
