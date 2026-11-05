// Prepara sample_mflix.movies para fragmentación hashed.
// Este script se ejecuta desde el router mongos.

const moviesDb = db.getSiblingDB("sample_mflix");
const movies = moviesDb.getCollection("movies");
const namespace = "sample_mflix.movies";

if (!moviesDb.getCollectionNames().includes("movies")) {
  throw new Error("No existe sample_mflix.movies. Importa primero el dataset de películas.");
}

// Crear id_movie a partir de _id para que cada documento tenga shard key.
const transformResult = movies.updateMany(
  {},
  [{ $set: { id_movie: { $toString: "$_id" } } }]
);
print("Documentos preparados:");
printjson(transformResult);

sh.enableSharding("sample_mflix");

// Evita intentar fragmentar de nuevo la colección si el script se ejecuta otra vez.
const collectionMetadata = db.getSiblingDB("config").collections.findOne({ _id: namespace });
if (!collectionMetadata) {
  movies.createIndex({ id_movie: "hashed" });
  sh.shardCollection(namespace, { id_movie: "hashed" });
  print("La colección se fragmentó por id_movie hashed.");
} else {
  print("La colección sample_mflix.movies ya estaba fragmentada.");
}

print("Distribución actual de películas:");
movies.getShardDistribution();
