const { startGeneratingSensorRecords, stopGeneratingSensorRecords, fetchSensorRecords } = require("../services/sensorService");
const { startFetchingSensorRecords, stopFetchingSensorRecords } = require("../services/sensorFetcherService");

// Iniciar generación automática de registros
const startGeneration = (req, res) => {
  console.log("**********")
  startGeneratingSensorRecords();
  res.json({ message: "Generación de registros iniciada." });
};

// Detener generación automática de registros
const stopGeneration = (req, res) => {
  stopGeneratingSensorRecords();
  res.json({ message: "Generación de registros detenida." });
};

// Iniciar extracción automática de registros
const startFetching = (req, res) => {
  startFetchingSensorRecords();
  res.json({ message: "Extracción de registros iniciada." });
};

const getSensorData = async (req, res) => {
  try {
    const sensorData = await fetchSensorRecords(); // Llamamos a la función modificada
    console.log("📡 Datos enviados a Next.js:", sensorData); // Verifica si es un array
    res.json({
      success: true,
      data: sensorData // 🔹 Aquí aseguramos que `data` contenga los sensores
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Detener extracción automática de registros
const stopFetching = (req, res) => {
  stopFetchingSensorRecords();
  res.json({ message: "Extracción de registros detenida." });
};

module.exports = { startGeneration, stopGeneration, startFetching, stopFetching, getSensorData };