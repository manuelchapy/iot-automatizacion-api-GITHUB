const { db } = require("../config/firebaseConfig");

// Sensores que queremos limpiar
const sensors = ["sensor_1", "sensor_2", "sensor_3"];

// Función para eliminar todos los registros dentro de una subcolección con batch delete
const deleteCollection = async (collectionRef) => {
  const snapshot = await collectionRef.get();
  
  if (snapshot.empty) {
    console.log("✅ No hay registros para eliminar.");
    return; // Si la colección está vacía, no hacer nada
  }

  // Crear un batch para eliminar múltiples documentos en una sola operación
  const batch = db.batch();

  snapshot.forEach(doc => {
    batch.delete(doc.ref);
  });

  // Ejecutar batch delete
  await batch.commit();
  console.log(`✅ ${snapshot.size} registros eliminados.`);
};

// Controlador para eliminar los registros de los sensores
const deleteAllSensorRecords = async (req, res) => {
  try {
    console.log("🧹 Eliminando todos los registros de sensores...");

    for (let sensorId of sensors) {
      const recordsRef = db.collection("sensor_records").doc(sensorId).collection("records");
      await deleteCollection(recordsRef);
      console.log(`🗑️ Eliminados todos los registros de ${sensorId}`);
    }

    return res.json({ message: "Todos los registros de sensores fueron eliminados correctamente." });
  } catch (error) {
    console.error("❌ Error al eliminar registros de sensores:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { deleteAllSensorRecords };