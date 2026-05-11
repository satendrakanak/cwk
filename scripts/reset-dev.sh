#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -f .env.development ]; then
  echo ".env.development not found. Nothing to reset."
  echo "Start development with: kasa install dev"
  exit 0
fi

echo "Stopping development stack and removing bundled Docker data..."
docker compose --env-file .env.development down -v

docker volume rm "${RUNTIME_VOLUME_NAME:-codewithkasa-dev_runtime_data}" >/dev/null 2>&1 || true

echo ""
echo "Development data has been reset."
echo ".env.development was kept in place. Edit it manually if you need env changes."
echo "Start a fresh install with:"
echo "  kasa install dev"
