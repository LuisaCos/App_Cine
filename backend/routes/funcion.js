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

//obtiene detalles de una función por ID
router.get('/funcion/:id', funcionesController.obtainFunction);

// obtiene estado de los asientos de una función
router.get('/funcion/:id/asientos', funcionesController.obtenerAsientosFuncion);

module.exports = router;