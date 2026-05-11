#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -f .env.docker ] && [ -f .env.docker.example ]; then
  cp .env.docker.example .env.docker
fi

echo "Stopping CodeWithKasa development stack..."
docker compose --env-file .env.docker down --remove-orphans
