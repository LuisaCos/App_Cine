const express = require('express');
const router = express.Router();
const authenticateJWT = require('../config/jwt');
const isAdmin = require('../middleware/isAdmin');
const salasController = require('../middleware/salasController');

// Crear sala (permiso de admin)
router.post('/salas', authenticateJWT, isAdmin, salasController.createSala);

// Obtener/ver todas las salas
router.get('/salas', salasController.getAllSalas);

// Actualizar sala (permiso de admin)
router.put('/salas/:id', authenticateJWT, isAdmin, salasController.updateSala);

// Modificar capacidad de sala (permiso de admin)
router.put('/salas/:id/capacidad', authenticateJWT, isAdmin, salasController.updateCapacidad);

// Eliminar sala (permiso de admin)
router.delete('/salas/:id', authenticateJWT, isAdmin, salasController.deleteSala);

module.exports = router;