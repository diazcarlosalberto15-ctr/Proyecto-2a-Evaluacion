#!/usr/bin/env bash
set -euo pipefail

if ! docker ps --format '{{.Names}}' | grep -qx 'mongos'; then
  echo "El contenedor mongos no está en ejecución."
  exit 1
fi

echo "Estado del clúster y distribución de chunks:"
docker exec mongos mongosh --port 27021 --eval 'sh.status(true)'
