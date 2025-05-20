require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./backend/config/db");
const userRoutes = require("./backend//routes/users"); // Importamos rutas de usuario
const authRoutes = require('./backend/middleware/authRoutes');     // Login y registro
const salasRoutes = require('./backend/routes/salas'); // Importamos rutas de salas
const peliculaRoutes = require('./backend/routes/pelicula'); // Importamos rutas de películas
const funcionRoutes = require('./backend/routes/funcion'); //Importamos ruta de funcion
const bodyParser = require("body-parser");

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// Carga de rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/salas', salasRoutes);
app.use('/api/peliculas', peliculaRoutes);
app.use('/api/funcion', funcionRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});