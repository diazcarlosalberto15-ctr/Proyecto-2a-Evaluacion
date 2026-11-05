# Proyecto 2a Evaluación — MongoDB Sharding

Proyecto de base de datos distribuida con MongoDB 7.0, Docker Compose y el dataset `sample_mflix`. La colección principal del ejercicio es `sample_mflix.movies`, fragmentada con una shard key hashed sobre `id_movie`.
Emilio Gallardo
Edgar Gutierrez
Carlos Diaz
## Estructura del repositorio

- `docker/docker-compose.yml`: configuración de los contenedores del clúster.
- `scripts/init-cluster.sh`: inicialización de config server, replica sets y router.
- `scripts/download-dataset.sh`: descarga del archivo de películas.
- `scripts/import-movies.sh`: importa los documentos en MongoDB.
- `scripts/run-sharding.sh`: ejecuta la preparación y fragmentación de `sample_mflix.movies`.
- `scripts/setup-sharding.js`: crea `id_movie`, el índice hashed y la shard key.
- `scripts/crud-movies.js`: operaciones CRUD con consulta de distribución después de cada operación (apartado de Emilio).
- `scripts/run-crud.sh`: copia y ejecuta el CRUD en el contenedor `mongos`.
- `scripts/show-shard-status.sh`: muestra `sh.status(true)` y los chunks.
- `docs/evidencia-emilio.md`: instrucciones para obtener y organizar las capturas.

## Requisitos

- Docker Desktop con Docker Compose.
- Git Bash, WSL o una terminal Bash.
- Conexión a Internet para descargar el dataset.

## Puesta en marcha del clúster

Ejecuta los comandos desde la raíz del repositorio:

```bash
docker compose -f docker/docker-compose.yml up -d
bash scripts/init-cluster.sh
bash scripts/download-dataset.sh
bash scripts/import-movies.sh
bash scripts/run-sharding.sh
```

El clúster utiliza un config server, tres shards y un router `mongos`. El shard 1 tiene un nodo secundario. El router queda disponible en el puerto `27021` del contenedor `mongos`.

Para revisar que los contenedores estén activos:

```bash
docker ps
```

## Apartado de: CRUD y monitoreo de la distribución

Una vez inicializado el clúster y fragmentada la colección, ejecuta:

```bash
bash scripts/run-crud.sh
```

El script realiza estas operaciones en `sample_mflix.movies`:

1. Inserta una primera película de prueba.
2. Inserta una segunda película de prueba.
3. Actualiza el año y el director de la primera película.
4. Consulta la primera película por `id_movie`.
5. Consulta la segunda película por `id_movie`.
6. Elimina la segunda película.
7. Elimina la primera película.

Después de cada operación imprime `db.movies.getShardDistribution()`. Los documentos de prueba reciben identificadores únicos y se eliminan al finalizar, para no alterar los registros originales del dataset.

### Estado de chunks y balanceador

Para consultar la asignación actual de chunks antes o después del CRUD:

```bash
bash scripts/show-shard-status.sh
```

Este comando ejecuta `sh.status(true)` desde `mongos`. Guarda una captura antes del CRUD y otra después para comparar la sección de chunks.

### Galería de evidencias 

<img width="1917" height="1034" alt="chunks 01" src="https://github.com/user-attachments/assets/cb76f8ea-b98c-424a-86ef-8d000d5c0830" />
<img width="1917" height="1029" alt="prueba del crud 01" src="https://github.com/user-attachments/assets/0931e53d-ff4f-47d2-9313-835d782a3912" />
<img width="1916" height="1028" alt="01-sh-status-inicial" src="https://github.com/user-attachments/assets/e164c801-7299-451b-a9ee-78e0106ec64e" />


