#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT_DIR"

. ./scripts/lib-install-state.sh

target="${1:-all}"

print_installation_state() {
  mode="$1"
  status_json="$(installer_status_json "$mode" || true)"

  if [ -z "$status_json" ]; then
    echo "Installation: unknown (app is not reachable)"
  elif status_is_installed "$status_json"; then
    echo "Installation: installed"
  elif status_is_not_installed "$status_json"; then
    echo "Installation: not installed"
  else
    echo "Installation: unknown"
  fi
}

print_dev_status() {
  echo "Development"
  if [ ! -f .env.docker ]; then
    echo "Environment: missing .env.docker"
    echo "Next: kasa install dev"
    return
  fi

  docker compose --env-file .env.docker ps
  print_installation_state dev
}

print_prod_status() {
  echo "Production test"
  if [ ! -f .env.production.local ]; then
    echo "Environment: missing .env.production.local"
    echo "Next: kasa install prod"
    return
  fi

  docker compose --env-file .env.production.local -f docker-compose.prod.yml ps
  print_installation_state prod
}

case "$target" in
  dev)
    print_dev_status
    ;;
  prod)
    print_prod_status
    ;;
  all|"")
    print_dev_status
    echo ""
    print_prod_status
    ;;
  *)
    echo "Unknown status target: $target"
    echo "Usage: kasa status [dev|prod]"
    exit 1
    ;;
esac
