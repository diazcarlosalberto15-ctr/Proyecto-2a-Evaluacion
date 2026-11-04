#!/bin/bash
# init-cluster.sh

echo "Inicializando Config Server..."
# Entra al contenedor 'configsvr' y ejecuta un comando en la terminal de Mongo
# rs.initiate() configura este nodo como un Replica Set exclusivo para metadatos (configsvr: true)
docker exec -it configsvr mongosh --port 27017 --eval 'rs.initiate({_id: "configReplSet", configsvr: true, members: [{ _id: 0, host: "configsvr:27017" }]})'

echo "Esperando 5 segundos para estabilizar Config Server..."
sleep 5

echo "Inicializando Shard 1 (Con nodo secundario)..."
# Inicializa el Shard 1 integrando dos contenedores físicos en un solo Replica Set, el nodo principal (shard1:27018) y el de respaldo (shard1-secundario:27022)
docker exec -it shard1 mongosh --port 27018 --eval 'rs.initiate({_id: "shard1ReplSet", members: [{ _id: 0, host: "shard1:27018" }, { _id: 1, host: "shard1-secundario:27022" }]})'

echo "Inicializando Shard 2..."
# Inicializa el Shard 2 con un solo nodo, sin respaldo
docker exec -it shard2 mongosh --port 27019 --eval 'rs.initiate({_id: "shard2ReplSet", members: [{ _id: 0, host: "shard2:27019" }]})'

echo "Inicializando Shard 3..."
docker exec -it shard3 mongosh --port 27020 --eval 'rs.initiate({_id: "shard3ReplSet", members: [{ _id: 0, host: "shard3:27020" }]})'

echo "Esperando 10 segundos para que los Shards levanten correctamente..."
sleep 10

echo "Agregando Shards al Router (mongos)..."
# Agrega los Shards al Router (mongos) para que pueda enrutar las consultas a los Shards correspondientes.
docker exec -it mongos mongosh --port 27021 --eval '
  sh.addShard("shard1ReplSet/shard1:27018,shard1-secundario:27022");
  sh.addShard("shard2ReplSet/shard2:27019");
  sh.addShard("shard3ReplSet/shard3:27020");
'

echo "========================================================"
echo "Configuración del clúster inicializada con éxito!"
echo "========================================================"
echo "Siguientes pasos para completar el setup:"
echo "1. Descargar los datos:   bash scripts/download-dataset.sh"
echo "2. Importar las peliculas: bash scripts/import-movies.sh"
echo "3. Aplicar el sharding:   bash scripts/run-sharding.sh"
echo "========================================================"