require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./backend/config/db");
const userRoutes = require("./backend//routes/users"); // Importamos rutas de usuario
const authRoutes = require('./backend/middleware/authRoutes');     // Login y registro
const bodyParser = require("body-parser");

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// Usa las rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});