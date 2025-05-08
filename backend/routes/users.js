const express = require('express');
const app = express();
app.use(express.json());
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/db'); 
require('dotenv').config();


const router = express.Router();

// REGISTRO DE USUARIO (Por defecto es cliente)
router.post("/register", async (req, res) => {
    const { nombre, email, contraseña, rol = "cliente" } = req.body;
  
    if (!nombre || !email || !contraseña) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }
  
    try {
      const hashedPassword = await bcrypt.hash(contraseña, 10);
      const sql = "INSERT INTO usuario (nombre, email, contraseña, rol) VALUES (?, ?, ?, ?)";
      await db.execute(sql, [nombre, email, hashedPassword, rol]);
  
      res.status(201).json({ message: "Usuario registrado correctamente" });
    } catch (error) {
      console.error("Error detallado:", error); // Para ver el error completo en la consola
      res.status(500).json({ message: "Error al registrar usuario", error });
    }
});

// Export the router
module.exports = router;

