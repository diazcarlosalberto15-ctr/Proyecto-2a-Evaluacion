set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p data
if [ -s data/movies.json ]; then
  echo "data/movies.json ya existe, no se descarga de nuevo."
else
  curl -L --fail -o data/movies.json \
    https://raw.githubusercontent.com/neelabalan/mongodb-sample-dataset/main/sample_mflix/movies.json
fi
echo "Documentos en el archivo: $(wc -l < data/movies.json)"