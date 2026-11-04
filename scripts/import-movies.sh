set -euo pipefail
export MSYS_NO_PATHCONV=1
cd "$(dirname "$0")/.."

[ -s data/movies.json ] || { echo "Falta data/movies.json. Ejecuta primero: bash scripts/download-dataset.sh"; exit 1; }

EXISTENTES=$(docker exec mongos mongosh --port 27021 --quiet --eval 'db.getSiblingDB("sample_mflix").movies.countDocuments()')
if [ "$EXISTENTES" -gt 0 ] && [ "${1:-}" != "--force" ]; then
  echo "sample_mflix.movies ya tiene $EXISTENTES documentos. Usa --force para reimportar."
  exit 0
fi

DROP=""
[ "${1:-}" == "--force" ] && DROP="--drop"

docker cp data/movies.json mongos:/tmp/movies.json
docker exec mongos mongoimport --host localhost --port 27021 \
  --db sample_mflix --collection movies --file /tmp/movies.json $DROP

echo "Total importado:"
docker exec mongos mongosh --port 27021 --quiet --eval 'db.getSiblingDB("sample_mflix").movies.countDocuments()'