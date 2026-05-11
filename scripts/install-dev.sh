#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT_DIR"

. ./scripts/lib-install-state.sh

if [ ! -f .env.docker ]; then
  cp .env.docker.example .env.docker
  echo "Created .env.docker from .env.docker.example"
else
  echo ".env.docker already exists"
fi

echo ""
echo "Checking CodeWithKasa development installation state..."
docker compose --env-file .env.docker up --build -d

status_json="$(wait_for_installer_status dev 30 || true)"
if [ -n "$status_json" ] && status_is_installed "$status_json"; then
  echo ""
  echo "CodeWithKasa is already installed."
  echo "Start development with: kasa start dev"
  exit 0
fi

echo ""
echo "CodeWithKasa is not installed yet. Streaming development logs..."
echo "Press Ctrl+C to stop the development stack."
echo ""
echo "Useful URLs:"
echo "  App:     http://localhost:3000"
echo "  API:     http://localhost:8000"
echo "  Swagger: http://localhost:8000/api"
echo ""
docker compose --env-file .env.docker up --build
