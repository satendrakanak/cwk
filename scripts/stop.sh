#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "Stopping CodeWithKasa Docker stacks..."

./scripts/stop-dev.sh
./scripts/stop-prod.sh

echo ""
echo "CodeWithKasa stacks are stopped."
echo "Ports should now be free."
