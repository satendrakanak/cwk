#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -f .env.docker ]; then
  cp .env.docker.example .env.docker
  echo "Created .env.docker from .env.docker.example"
fi

echo "Stopping development stack and removing bundled Docker data..."
docker compose --env-file .env.docker down -v

docker volume rm "${RUNTIME_VOLUME_NAME:-codewithkasa-dev_runtime_data}" >/dev/null 2>&1 || true

echo ""
echo "Development data has been reset."
echo ".env.docker was kept in place. Edit it manually if you need env changes."
echo "Start a fresh install with:"
echo "  kasa install dev"
