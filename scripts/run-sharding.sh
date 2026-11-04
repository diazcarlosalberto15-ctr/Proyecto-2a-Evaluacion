#!/bin/bash
# run-sharding.sh

# Apaga la traducción automática de rutas en Git Bash para Windows
export MSYS_NO_PATHCONV=1

echo "Copiando script de sharding al router mongos..."
docker cp scripts/setup-sharding.js mongos:/tmp/setup-sharding.js

echo "Ejecutando script de transformación y fragmentación..."
docker exec mongos mongosh --port 27021 /tmp/setup-sharding.js

echo "Configuración finalizada."