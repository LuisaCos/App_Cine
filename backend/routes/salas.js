const express = require('express');
const router = express.Router();
const authenticateJWT = require('../config/jwt');
const isAdmin = require('../middleware/isAdmin');
const salasController = require('../middleware/salasController');

// Crear sala (permiso de admin)
router.post('/', authenticateJWT, isAdmin, salasController.createSala)

// Actualizar o modificar sala (permiso de admin)
router.put('/:idsalas', authenticateJWT, isAdmin, salasController.updateCapacitySala) 

module.exports = router;
