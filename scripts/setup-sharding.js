// Seleccionamos la base de datos
const db = db.getSiblingDB('sample_mflix');

// 1. Agregar el id_movie a todos los documentos
db.movies.updateMany({}, [{ $set: { id_movie: { $toString: "$_id" } } }]);

// 2. Crear un índice para la nueva Shard Key 
db.movies.createIndex({ "id_movie": "hashed" });

// 3. Habilitar sharding en la base de datos
sh.enableSharding("sample_mflix");

// 4. Aplicar la fragmentación Hashed
sh.shardCollection("sample_mflix.movies", { "id_movie": "hashed" });

print("Transformación y Sharding completados con éxito!");