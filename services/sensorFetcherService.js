const { db } = require("../config/firebaseConfig");

const sensors = ["sensor_1", "sensor_2", "sensor_3"];
let fetchIntervalId = null; // Almacena el identificador del intervalo

// Función para extraer los registros de cada sensor
const fetchSensorRecords = async () => {
  try {
    console.log("\n🔍 Recuperando registros de sensores...\n");
    let allRecords = [];

    for (let sensorId of sensors) {
      const recordsRef = db.collection("sensor_records").doc(sensorId).collection("records");
      const snapshot = await recordsRef.orderBy("timestamp", "desc").limit(100).get();
    
      let records = [];
      snapshot.forEach(doc => records.push(doc.data()));

      console.log(`📡 Sensor: ${sensorId}`);
      console.log(`📊 Total de registros: ${records.length}`);

      allRecords.push({ sensorId, records });
    }

    return allRecords;
  } catch (error) {
    console.error("❌ Error al recuperar registros de sensores:", error.message);
    return [];
  }
};

// **Función para iniciar la extracción automática**
const startFetchingSensorRecords = () => {
  if (!fetchIntervalId) {
    fetchIntervalId = setInterval(fetchSensorRecords, 5000);
    console.log("✅ Extracción de registros iniciada.");
  } else {
    console.log("⚠️ La extracción ya está en ejecución.");
  }
};

// **Función para detener la extracción automática**
const stopFetchingSensorRecords = () => {
  if (fetchIntervalId) {
    clearInterval(fetchIntervalId);
    fetchIntervalId = null;
    console.log("🛑 Extracción de registros detenida.");
  } else {
    console.log("⚠️ No hay extracción en ejecución.");
  }
};

module.exports = { startFetchingSensorRecords, stopFetchingSensorRecords };

