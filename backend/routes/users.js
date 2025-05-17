const express = require('express');
const router = express.Router();
const usersController = require('../middleware/usersController');
const authenticateJWT = require('../config/jwt');
const isAdmin = require('../middleware/isAdmin');

// Listar todos los usuarios (solo admin)
router.get('/', authenticateJWT, isAdmin, usersController.getAllUsers);

// Obtener un usuario por ID (admin o el mismo usuario)
router.get('/:id', authenticateJWT, usersController.getUserById);

// Actualizar usuario (admin puede cambiar rol, cliente solo su info)
router.put('/:id', authenticateJWT, usersController.updateUser);

// Eliminar usuario (solo admin)
router.delete('/:id', authenticateJWT, isAdmin, usersController.deleteUser);

module.exports = router;