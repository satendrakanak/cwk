#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT_DIR"

. ./scripts/lib-install-state.sh

create_production_env() {
  cat > .env <<'ENV'
SERVER_IMAGE=ghcr.io/YOUR_GITHUB_OWNER/codewithkasa-server:latest
CLIENT_IMAGE=ghcr.io/YOUR_GITHUB_OWNER/codewithkasa-client:latest

CLIENT_PORT=3000
SERVER_PORT=8000
POSTGRES_PORT=5432

NODE_ENV=production
APP_URL=https://api.your-domain.com
APP_PORT=8000
FRONT_END_URL=https://your-domain.com
API_VERSION=0.1.1

DATABASE_HOST=your-managed-postgres-host
DATABASE_PORT=5432
DATABASE_USER=your-db-user
DATABASE_PASSWORD=your-db-password
DATABASE_NAME=codewithkasa
DATABASE_SYNC=false
DATABASE_AUTO_LOAD=true

POSTGRES_USER=codewithkasa
POSTGRES_PASSWORD=replace-with-production-db-password
POSTGRES_DB=codewithkasa

JWT_SECRET=replace-with-a-long-random-secret
JWT_TOKEN_AUDIENCE=https://your-domain.com
JWT_TOKEN_ISSUER=https://api.your-domain.com
JWT_ACCESS_TOKEN_TTL=3600
JWT_REFRESH_TOKEN_TTL=86400

REDIS_HOST=redis
REDIS_PORT=6379
RUNTIME_VOLUME_NAME=codewithkasa-prod_runtime_data
RUNTIME_VOLUME_EXTERNAL=false

APP_ENCRYPTION_KEY=replace-with-a-long-random-secret

LICENSE_PORTAL_URL=https://license.your-domain.com
LICENSE_PRODUCT_SLUG=codewithkasa

NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_BASE_URL=http://server:8000
ENV
}

if [ ! -f .env ]; then
  create_production_env
  echo "Created .env"
  echo "Fill production secrets/domains in .env, then run: kasa install prod"
  exit 1
fi

echo "Starting CodeWithKasa production stack..."
docker compose --env-file .env -f docker-compose.prod.yml up --build -d

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
