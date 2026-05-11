#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT_DIR"

. ./scripts/lib-install-state.sh

if [ ! -f .env.production ]; then
  cp .env.production.example .env.production
  echo "Created .env.production from .env.production.example"
  echo "Fill production secrets/domains in .env.production, then run: kasa install prod"
  exit 1
fi

echo "Starting CodeWithKasa production stack..."
docker compose --env-file .env.production -f docker-compose.prod.yml up --build -d

status_json="$(wait_for_installer_status prod 30 || true)"
if [ -n "$status_json" ] && status_is_installed "$status_json"; then
  echo ""
  echo "CodeWithKasa is already installed."
  echo "Start production with: kasa start"
  exit 0
fi

echo ""
echo "CodeWithKasa production stack is running."
echo ""
echo "Stop all Kasa containers:"
echo "  kasa stop"
echo ""
echo "Start this stack again later:"
echo "  kasa start"
echo ""
echo "Restart after external database selection:"
echo "  kasa restart prod"
