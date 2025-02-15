const admin = require("firebase-admin");
const path = require("path");

// 📌 Ruta absoluta del archivo de credenciales dentro del proyecto
const serviceAccountPath = path.join(__dirname, "monitoreo-iot-21ecb-firebase-adminsdk-fbsvc-5d3072476f.json");

// 🔹 Verificar si Firebase ya está inicializado para evitar múltiples inicializaciones
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath)), // 🔹 Cargar desde el archivo JSON
    databaseURL: "https://monitoreo-iot-21ecb.firebaseio.com" // Reemplaza con tu URL real de Firebase
  });
}

const db = admin.firestore();

module.exports = { db };