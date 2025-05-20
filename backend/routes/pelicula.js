const express = require('express');
const router = express.Router();
const authenticateJWT = require('../config/jwt');
const isAdmin = require('../middleware/isAdmin');
const peliculasController = require('../middleware/peliculasController');

// Obtener todas las películas
router.get('/peliculas', peliculasController.obtainAll);

// Obtener una película específica
router.get('/peliculas/:id', peliculasController.obtainMovie);

// Crear una nueva película (solo admin)
router.post('/peliculas', authenticateJWT, isAdmin, peliculasController.createMovie);

// Actualizar una película (solo admin)
router.put('/peliculas/:id', authenticateJWT, isAdmin, peliculasController.updateMovie);

// Eliminar una película (solo admin)
router.delete('/peliculas/:id', authenticateJWT, isAdmin, peliculasController.deleteMovie);

module.exports = router;