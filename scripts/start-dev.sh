#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -f .env.docker ]; then
  echo ".env.docker not found."
  echo "Run first-time setup with: kasa install dev"
  exit 1
fi

echo "Starting CodeWithKasa development stack..."
docker compose --env-file .env.docker up -d

echo ""
echo "CodeWithKasa development stack is running."
echo "App:       http://localhost:3000"
echo "Installer: http://localhost:3000/install"
echo "API:       http://localhost:8000"
