const express = require("express");
const { getSensorRecords, createSensorRecord } = require("../controllers/sensorController");
const { deleteAllSensorRecords } = require("../controllers/sensorCleanupController");
const { startGeneration, stopGeneration, startFetching, stopFetching, getSensorData } = require("../controllers/sensorControlController");
const { resetSensors } = require("../services/sensorService")

const router = express.Router();


router.get("/reset-sensors", async (req, res) => {
  console.log("******************************")
  resetSensors(); // 🔄 Llamar a la función de reinicio
  return res.json({ message: "✅ Sensores restablecidos correctamente." });
});

// ✅ Rutas específicas
router.delete("/cleanup", deleteAllSensorRecords);  // 🔥 Se cambia de "/cleanup" a "/cleanup-all"
router.get("/start-generation", startGeneration);
router.get("/stop-generation", stopGeneration);
router.get("/start-fetching", startFetching);
router.get("/stop-fetching", stopFetching);
router.get("/sensor-data", getSensorData);


router.use("/:sensorId", (req, res, next) => {
    if (req.params.sensorId === "cleanup") {
      return deleteAllSensorRecords(req, res);
    }
    next(); // Continua con las rutas dinámicas
  });
// ✅ Luego, rutas dinámicas (se colocan al final para evitar conflictos)
router.get("/:sensorId", getSensorRecords);
router.post("/:sensorId", createSensorRecord);

module.exports = router;