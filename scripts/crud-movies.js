// Operaciones CRUD con monitoreo de distribución de sample_mflix.movies.
// Ejecutar desde mongosh conectado al router mongos (puerto 27021).
// Después de CADA operación se imprime getShardDistribution().

const moviesDb = db.getSiblingDB("sample_mflix");
const movies = moviesDb.getCollection("movies");
const namespace = "sample_mflix.movies";

const metadata = db.getSiblingDB("config").collections.findOne({ _id: namespace });
if (!metadata) {
  throw new Error("La colección sample_mflix.movies todavía no está fragmentada. Ejecuta antes scripts/run-sharding.sh.");
}

const hashedIndex = movies.getIndexes().some(
  (index) => index.key && index.key.id_movie === "hashed"
);
if (!hashedIndex) {
  throw new Error("No se encontró el índice hashed de id_movie. Revisa la configuración de sharding.");
}

// Identificadores únicos para no modificar películas de la muestra ni chocar
// con una ejecución anterior.
const runTag = "emilio-crud-" + Date.now();
const movieAId = runTag + "-01";
const movieBId = runTag + "-02";

function monitor(label) {
  print("\n============================================================");
  print("DISTRIBUCION DESPUES DE: " + label);
  print("Ejecucion: " + runTag);
  print(new Date().toISOString());
  print("============================================================");
  movies.getShardDistribution();
}

print("\nBase de datos: sample_mflix");
print("Coleccion: movies");
print("Router: mongos");
print("Identificador de esta prueba: " + runTag);

// 1. CREATE: insertar una película.
const insertA = movies.insertOne({
  id_movie: movieAId,
  title: "Prueba CRUD - Pelicula Uno",
  year: 2024,
  directors: ["Director original"],
  cast: ["Actor de prueba"],
  genres: ["Drama"],
  type: "movie",
  plot: "Registro de prueba para comprobar las operaciones CRUD en un cluster MongoDB fragmentado.",
  countries: ["Mexico"],
  languages: ["Spanish"]
});
print("\nINSERT 1 - resultado:");
printjson(insertA);
monitor("INSERT 1");

// 2. CREATE: insertar una segunda película.
const insertB = movies.insertOne({
  id_movie: movieBId,
  title: "Prueba CRUD - Pelicula Dos",
  year: 2023,
  directors: ["Directora original"],
  cast: ["Actriz de prueba"],
  genres: ["Ciencia ficcion"],
  type: "movie",
  plot: "Segundo registro de prueba para revisar la distribucion de documentos.",
  countries: ["Mexico"],
  languages: ["Spanish"]
});
print("\nINSERT 2 - resultado:");
printjson(insertB);
monitor("INSERT 2");

// 3. UPDATE: cambiar el año y el director de la primera película.
// El filtro incluye la shard key para localizar el documento directamente.
const updateResult = movies.updateOne(
  { id_movie: movieAId },
  {
    $set: {
      year: 2025,
      directors: ["Director actualizado"],
      plot: "Registro actualizado durante la prueba CRUD."
    }
  }
);
print("\nUPDATE - resultado:");
printjson(updateResult);
monitor("UPDATE");

// 4. READ: consulta específica por id_movie (shard key).
const queryA = movies.find(
  { id_movie: movieAId },
  { _id: 1, id_movie: 1, title: 1, year: 1, directors: 1, genres: 1 }
).toArray();
print("\nCONSULTA 1 - pelicula actualizada por id_movie:");
printjson(queryA);
monitor("CONSULTA 1");

// 5. READ: consulta específica de la segunda película.
const queryB = movies.find(
  { id_movie: movieBId },
  { _id: 1, id_movie: 1, title: 1, year: 1, directors: 1, genres: 1 }
).toArray();
print("\nCONSULTA 2 - segunda pelicula por id_movie:");
printjson(queryB);
monitor("CONSULTA 2");

// 6. DELETE: eliminar la segunda película.
const deleteB = movies.deleteOne({ id_movie: movieBId });
print("\nDELETE 1 - resultado:");
printjson(deleteB);
monitor("DELETE 1");

// 7. DELETE: eliminar la primera película.
const deleteA = movies.deleteOne({ id_movie: movieAId });
print("\nDELETE 2 - resultado:");
printjson(deleteA);
monitor("DELETE 2");

print("\n============================================================");
print("FIN DE LA PRUEBA CRUD");
print("Documentos de prueba restantes: " + movies.countDocuments({
  id_movie: { $in: [movieAId, movieBId] }
}));
print("La prueba elimina sus dos registros para dejar limpia la coleccion.");
print("============================================================");
