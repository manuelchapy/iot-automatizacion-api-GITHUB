require("dotenv").config();
const app = require("./config/expressConfig");
const sensorRoutes = require("./routes/sensorRoutes");

// Rutas
app.use("/api/sensors", sensorRoutes);

// Servidor en Express
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));