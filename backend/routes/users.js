const express = require('express');
const router = express.Router();
const usersController = require('../middleware/usersController');
const authenticateJWT = require('../config/jwt');
const isAdmin = require('../middleware/isAdmin');

// Listar todos los usuarios (permiso de admin)
router.get('/', authenticateJWT, isAdmin, usersController.getAllUsers);

// Obtener un usuario por ID (Mostrar el perfil del usuario)
router.get('/:id', authenticateJWT, usersController.getUserById);

// Actualizar solo el rol (permiso de admin)
router.put('/:id/rol', authenticateJWT, isAdmin, usersController.updateUserRole);

// Deshabilitar o habilitar usuario (permiso de admin)
router.put('/:id/estado', authenticateJWT, isAdmin, usersController.toggleUserStatus);

module.exports = router;