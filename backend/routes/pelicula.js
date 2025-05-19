const express = require('express');
const router = express.Router();
const authenticateJWT = require('../config/jwt');
const isAdmin = require('../middleware/isAdmin');
const peliculasController = require('../middleware/peliculasController');

router.get('/peliculas', peliculasController.obtenerPeliculas);

router.get('/peliculas/:id', peliculasController.obtenerPelicula);

router.post('/peliculas', authenticateJWT, isAdmin, peliculasController.crearPelicula);

router.put('/peliculas/:id', authenticateJWT, isAdmin, peliculasController.actualizarPelicula);

router.delete('/peliculas/:id', authenticateJWT, isAdmin, peliculasController.eliminarPelicula);

module.exports = router;