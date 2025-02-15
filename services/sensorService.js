const { db } = require("../config/firebaseConfig");

const sensors = [
  { id: "sensor_1", location: "Sala de Control", lastValue: 25 },
  { id: "sensor_2", location: "Almacén", lastValue: 27 },
  { id: "sensor_3", location: "Laboratorio", lastValue: 30 }
];

let intervalId = null; // Almacena el identificador del intervalo

// Genera una temperatura coherente
const generateTemperature = (lastValue) => {
  let variation = Math.random() * 2 - 1;
  let newValue = lastValue + variation;
  return parseFloat(Math.max(10, Math.min(60, newValue)).toFixed(1));
};

// 📌 Set para almacenar los sensores dañados
const damagedSensors = new Set();

const fetchSensorRecords = async () => {
  try {
    console.log("🔍 Iniciando recuperación de registros de sensores...");

    let allRecords = [];

    for (let sensor of sensors) {
      console.log(`📡 Buscando datos para el sensor: ${sensor.id}`);

      const recordsRef = db.collection("sensor_records").doc(sensor.id).collection("records");
      const snapshot = await recordsRef.orderBy("timestamp", "desc").limit(10).get();

      let records = [];
      snapshot.forEach(doc => records.push(doc.data()));

      console.log(`📊 Registros encontrados para ${sensor.id}:`, records.length);

      allRecords.push({
        id: sensor.id,
        location: sensor.location,
        lastValue: records.length > 0 ? records[0].value : null
      });
    }

    console.log("✅ Datos recopilados:", allRecords);

    return allRecords; // 🔹 Nos aseguramos de que devuelve un array
  } catch (error) {
    console.error("❌ Error en fetchSensorRecords:", error.message);
    return []; // Retorna un array vacío en caso de error
  }
};


// Verifica si un sensor está dañado
const checkSensorStatus = async (sensorId) => {
  if (damagedSensors.has(sensorId)) return; // ⚠️ Si ya está dañado, salir inmediatamente

  const now = Date.now();
  const oneMinuteAgo = now - 60 * 1000; // Último minuto en milisegundos

  const recordsRef = db.collection("sensor_records").doc(sensorId).collection("records");
  const snapshot = await recordsRef.orderBy("timestamp", "desc").limit(10).get(); // Últimos 10 registros

  let criticalCount = 0;
  
  snapshot.forEach((doc) => {
      let data = doc.data();
      let recordTimestamp = new Date(data.timestamp).getTime(); // Convertir timestamp a Date

      if (recordTimestamp >= oneMinuteAgo && data.value > 50) {
          criticalCount++;
      }
  });

  console.log(`🔎 CRITICAL COUNT para ${sensorId}:`, criticalCount);

  if (criticalCount >= 6) {
      console.log(`🚨 Sensor ${sensorId} ha sido marcado como DAÑADO y no generará más registros.`);

      // Guardar estado de DAÑADO en Firestore
      await recordsRef.add({
          timestamp: new Date().toISOString(),
          value: null,
          unit: "°C",
          status: "SENSOR_DAMAGED"
      });

      // 📌 Marcar el sensor como dañado en memoria para evitar que siga generando datos
      damagedSensors.add(sensorId);
  }
};

// 📡 Función para generar registros de sensores automáticamente
const startGeneratingSensorRecords = () => {
  if (!intervalId) {
    let recordCounts = { sensor_1: 0, sensor_2: 0, sensor_3: 0 };

    intervalId = setInterval(async () => {
      let allSensorsDamaged = true; // ✅ Variable para detectar si todos están dañados

      for (let sensor of sensors) {
        if (damagedSensors.has(sensor.id)) {
          console.log(`⛔ ${sensor.id} está DAÑADO. No generará más registros.`);
          continue;
        }

        allSensorsDamaged = false; // Si hay al menos un sensor funcionando, se mantiene generando

        recordCounts[sensor.id]++;
        let newValue = recordCounts[sensor.id] > 20 ? Math.random() * 10 + 50 : generateTemperature(sensor.lastValue);

        sensor.lastValue = newValue;
        let status = newValue > 50 ? "CRITICAL" : "NORMAL";

        const sensorRef = db.collection("sensor_records").doc(sensor.id).collection("records");
        await sensorRef.add({
          timestamp: new Date().toISOString(),
          value: newValue,
          unit: "°C",
          status: status
        });

        console.log(`📡 ${sensor.id} - ${sensor.location}: ${newValue}°C (${status})`);

        await checkSensorStatus(sensor.id);
      }

      // 🔹 Si todos los sensores están dañados, detener la generación
      if (allSensorsDamaged) {
        stopGeneratingSensorRecords();
      }
    }, 10000);
  }
};

// **Función para detener la generación**
const stopGeneratingSensorRecords = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log("🛑 Generación de registros detenida.");
  } else {
    console.log("⚠️ No hay generación en ejecución.");
  }
};

const resetSensors = () => {
  console.log("✅ Reseteando sensores...");
  sensors.forEach((sensor) => {
    sensor.lastValue = 25; // 🔄 Reiniciar temperatura
    damagedSensors.delete(sensor.id); // 🔄 Quitar de la lista de sensores dañados
  });
  console.log("✅ Sensores reiniciados correctamente.");
};

module.exports = { startGeneratingSensorRecords, stopGeneratingSensorRecords, checkSensorStatus, damagedSensors, fetchSensorRecords, resetSensors };