#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -f .env.docker ]; then
  echo ".env.docker not found."
  echo "Run first-time setup with: kasa install dev"
  exit 1
fi

echo ""
echo "Starting CodeWithKasa development stack with live logs..."
echo "Press Ctrl+C to stop the development stack."
echo ""
echo "Useful URLs after the containers are ready:"
echo "Installer: http://localhost:3000/install"
echo "App:       http://localhost:3000"
echo "API:       http://localhost:8000"
echo ""
docker compose --env-file .env.docker up
