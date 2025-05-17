const db = require('../config/db');
const bcrypt = require('bcrypt');

// Obtener todos los usuarios (Para administrador)
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.execute('SELECT idusuario, nombre, email, rol, estado FROM usuario');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

// Obtener usuario por ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute('SELECT idusuario, nombre, email, rol, estado FROM usuario WHERE idusuario = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el usuario' });
  }
};

// Actualizar rol del usuario (Para administrador)
exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { rol } = req.body;

  try {
    await db.execute('UPDATE usuario SET rol = ? WHERE idusuario = ?', [rol, id]);
    res.status(200).json({ message: 'Rol actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar el rol del usuario' });
  }
};

// Actualizar estado (habilitar o deshabilitar usuario)
exports.toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body; //1 es activo, 0 desactivado

  try {
    await db.execute('UPDATE usuario SET estado = ? WHERE idusuario = ?', [estado, id]);
    res.status(200).json({ message: 'Estado del usuario actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar el estado del usuario' });
  }
};
