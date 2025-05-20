require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./backend/config/db");
const userRoutes = require("./backend/routes/users");
const authRoutes = require('./backend/middleware/authRoutes');
const salasRoutes = require('./backend/routes/salas');
const peliculaRoutes = require('./backend/routes/pelicula');
const funcionRoutes = require('./backend/routes/funcion');
const reservaRoutes = require('./backend/routes/reservacion');
const bodyParser = require("body-parser");

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true
}));
app.use(bodyParser.json());

// Carga de rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/salas', salasRoutes);
app.use('/api/peliculas', peliculaRoutes);
app.use('/api/funcion', funcionRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});