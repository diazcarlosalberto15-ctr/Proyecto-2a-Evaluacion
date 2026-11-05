#!/usr/bin/env bash
set -euo pipefail
export MSYS_NO_PATHCONV=1
cd "$(dirname "$0")/.."

if ! docker ps --format '{{.Names}}' | grep -qx 'mongos'; then
  echo "El contenedor mongos no está en ejecución. Levanta primero el clúster con Docker Compose."
  exit 1
fi

docker cp scripts/crud-movies.js mongos:/tmp/crud-movies.js
docker exec mongos mongosh --port 27021 /tmp/crud-movies.js
