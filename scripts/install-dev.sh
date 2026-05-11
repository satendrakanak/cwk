#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT_DIR"

. ./scripts/lib-install-state.sh

create_development_env() {
  cat > .env.development <<'ENV'
CLIENT_PORT=3000
SERVER_PORT=8000
POSTGRES_PORT=5433
REDIS_PORT=6379

POSTGRES_USER=codewithkasa
POSTGRES_PASSWORD=change-me-local
POSTGRES_DB=codewithkasa
POSTGRES_VOLUME_NAME=codewithkasa-dev_postgres_data
REDIS_VOLUME_NAME=codewithkasa-dev_redis_data
RUNTIME_VOLUME_NAME=codewithkasa-dev_runtime_data

NODE_ENV=development
APP_URL=http://localhost:8000
APP_PORT=8000
FRONT_END_URL=http://localhost:3000
API_VERSION=0.1.1

DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=codewithkasa
DATABASE_PASSWORD=change-me-local
DATABASE_NAME=codewithkasa
DATABASE_SYNC=true
DATABASE_AUTO_LOAD=true

JWT_SECRET=change-me-local-jwt-secret
JWT_TOKEN_AUDIENCE=http://localhost:3000
JWT_TOKEN_ISSUER=http://localhost:8000
JWT_ACCESS_TOKEN_TTL=3600
JWT_REFRESH_TOKEN_TTL=86400

REDIS_HOST=redis
REDIS_PORT=6379

APP_ENCRYPTION_KEY=change-me-local-encryption-key

LICENSE_PORTAL_URL=http://localhost:5000
LICENSE_PRODUCT_SLUG=codewithkasa

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://server:8000
ENV
}

if [ ! -f .env.development ]; then
  create_development_env
  echo "Created .env.development"
else
  echo ".env.development already exists"
fi

echo ""
echo "Checking CodeWithKasa development installation state..."
docker compose --env-file .env.development up --build -d

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
docker compose --env-file .env.development up --build
