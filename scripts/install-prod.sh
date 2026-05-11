#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT_DIR"

. ./scripts/lib-install-state.sh

if [ ! -f .env.production.local ]; then
  cp .env.production.local.example .env.production.local
  echo "Created .env.production.local from .env.production.local.example"
else
  echo ".env.production.local already exists"
fi

echo "Starting CodeWithKasa production test stack..."
docker compose --env-file .env.production.local -f docker-compose.prod.yml up --build -d

status_json="$(wait_for_installer_status prod 30 || true)"
if [ -n "$status_json" ] && status_is_installed "$status_json"; then
  echo ""
  echo "CodeWithKasa is already installed."
  echo "Start production test mode with: kasa start"
  exit 0
fi

echo ""
echo "CodeWithKasa production test stack is running."
echo ""
echo "Useful URLs:"
echo "  App:     http://localhost:3000"
echo "  API:     http://localhost:8000"
echo "  Swagger: http://localhost:8000/api"
echo ""
echo "Logs:"
echo "  make prod-logs"
echo ""
echo "Stop all Kasa containers:"
echo "  kasa stop"
echo ""
echo "Start this stack again later:"
echo "  kasa start prod"
echo ""
echo "Restart after external database selection:"
echo "  kasa restart prod"
