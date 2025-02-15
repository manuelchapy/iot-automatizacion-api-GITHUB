const admin = require("firebase-admin");
const serviceAccount = require("../monitoreo-iot-21ecb-firebase-adminsdk-fbsvc-ccac309e73.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tu-proyecto.firebaseio.com"
});

const db = admin.firestore();

module.exports = { db };