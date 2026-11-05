# Evidencia de Emilio: operaciones CRUD y monitoreo de shards

## Requisitos previos

1. Docker Desktop debe estar abierto.
2. Los contenedores del clúster deben estar activos.
3. Debe haberse importado `sample_mflix.movies` y ejecutado `scripts/run-sharding.sh`.
4. El comando `docker ps` debe mostrar el contenedor `mongos`.

## Ejecutar las operaciones

Desde la carpeta raíz del repositorio, abre Git Bash o una terminal con Bash y ejecuta:

```bash
bash scripts/run-crud.sh
```

El programa inserta dos películas de prueba, actualiza el año y director de la primera, realiza dos consultas y elimina ambos registros al terminar. Después de cada una de esas siete operaciones imprime `db.movies.getShardDistribution()` con un encabezado para identificar el paso.

Los identificadores incluyen la fecha de ejecución para evitar modificar películas existentes. Al terminar, el script elimina los registros que creó.

## Consultar los chunks

Antes y después del CRUD, ejecuta:

```bash
bash scripts/show-shard-status.sh
```

El comando llama a `sh.status(true)` desde `mongos` y muestra la configuración de los shards y la información detallada de chunks. Conviene guardar una captura inicial y otra final para poder comparar la asignación.

## Capturas que deben agregarse a GitHub

Guarda las capturas reales dentro de `docs/evidencias/emilio/` con estos nombres:

| Archivo | Evidencia |
| --- | --- |
| `01-sh-status-inicial.png` | `sh.status(true)` antes del CRUD, con la sección de chunks. |
| `02-insert-1.png` | Resultado del primer insert y su `getShardDistribution()`. |
| `03-insert-2.png` | Resultado del segundo insert y su `getShardDistribution()`. |
| `04-update.png` | Actualización del año/director y su distribución. |
| `05-consulta-1.png` | Primera consulta y su distribución. |
| `06-consulta-2.png` | Segunda consulta y su distribución. |
| `07-delete-1.png` | Primera eliminación y su distribución. |
| `08-delete-2.png` | Segunda eliminación y su distribución. |
| `09-sh-status-final.png` | `sh.status(true)` después del CRUD, con la sección de chunks. |

Para tomar las capturas, deja visible el encabezado `DISTRIBUCION DESPUES DE` correspondiente y la salida completa de `getShardDistribution()`. Si el script ya terminó, desplázate hacia arriba en la terminal para capturar cada bloque.

## Nota sobre el balanceador

`getShardDistribution()` muestra los documentos y el tamaño estimado por shard. `sh.status(true)` muestra la asignación actual de chunks. No todas las operaciones CRUD provocan una migración: el balanceador trabaja en segundo plano y solo mueve rangos cuando se alcanza su umbral de desequilibrio. Con el tamaño predeterminado de chunk de 128 MB, MongoDB documenta un umbral de diferencia de 384 MB entre shards para iniciar el balanceo. Por eso no se debe afirmar que hubo migración si la comparación de `sh.status(true)` no lo demuestra.

Documentación: https://www.mongodb.com/docs/manual/core/sharding-balancer-administration/
