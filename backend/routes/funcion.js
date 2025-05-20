const express = require('express');
const router = express.Router();
const authenticateJWT = require('../config/jwt'); 
const isAdmin = require('../middleware/isAdmin'); 
const funcionesController = require('../middleware/funcionController');

// Crear función (solo admin)
router.post('/funcion', authenticateJWT, isAdmin, funcionesController.createFunction);

// Modificar función (solo admin)
router.put('/funcion/:id', authenticateJWT, isAdmin, funcionesController.updateFunction);

// Listar funciones
router.get('/funcion', funcionesController.obtainFunction);

module.exports = router;