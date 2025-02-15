const { db } = require("../config/firebaseConfig");
const { generateSensorData } = require("../services/sensorService");

// GET: Obtener registros de un sensor específico
const getSensorRecords = async (req, res) => {
  try {
    const { sensorId } = req.params;
    const recordsRef = db.collection("sensor_records").doc(sensorId).collection("records");
    const snapshot = await recordsRef.orderBy("timestamp", "desc").limit(50).get();

    let records = [];
    snapshot.forEach(doc => records.push(doc.data()));

    return res.json({ sensorId, records });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// POST: Generar y almacenar un nuevo registro para un sensor
const createSensorRecord = async (req, res) => {
  try {
    const { sensorId } = req.params;
    const newRecord = generateSensorData(sensorId);

    await db.collection("sensor_records").doc(sensorId).collection("records").add(newRecord);

    return res.status(201).json({ message: "Registro agregado", data: newRecord });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { getSensorRecords, createSensorRecord };
