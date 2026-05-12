#!/usr/bin/env sh

dev_client_container() {
  printf '%s\n' "codewithkasa-client-dev"
}

prod_client_container() {
  docker compose --env-file .env -f docker-compose.prod.yml ps -q client 2>/dev/null || true
}

installer_status_json() {
  mode="$1"

  if [ "$mode" = "dev" ]; then
    container="$(dev_client_container)"
  else
    container="$(prod_client_container)"
  fi

  if [ -z "$container" ]; then
    return 1
  fi

  docker exec "$container" wget -qO- http://server:8000/installer/status 2>/dev/null || true
}

wait_for_installer_status() {
  mode="$1"
  attempts="${2:-30}"
  count=0

  while [ "$count" -lt "$attempts" ]; do
    status_json="$(installer_status_json "$mode")"
    if [ -n "$status_json" ]; then
      printf '%s\n' "$status_json"
      return 0
    fi
    count=$((count + 1))
    sleep 2
  done

  return 1
}

status_is_installed() {
  printf '%s' "$1" | grep -q '"isInstalled":true'
}

status_is_not_installed() {
  printf '%s' "$1" | grep -q '"isInstalled":false'
}
