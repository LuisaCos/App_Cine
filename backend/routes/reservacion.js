const express = require('express');
const router = express.Router();
const reservasController = require('../middleware/reservacionController');

router.post('/reservas', reservasController.crearReservacion);
router.get('/reservas/:usuarioId', reservasController.confirmarReservacion);
router.get('/reservas/:reservaId', reservasController.generarQR);

module.exports = router;