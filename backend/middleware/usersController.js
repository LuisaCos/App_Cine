const db = require('../config/db');
const bcrypt = require('bcrypt');
const { generateToken } = require("../config/jwt");

// Obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.execute('SELECT id, nombre, email, rol FROM usuario');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

// Obtener usuario por ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute('SELECT id, nombre, email, rol FROM usuario WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el usuario' });
  }
};

// Actualizar usuario
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { nombre, email, contraseña, rol } = req.body;
  try {
    let query = 'UPDATE usuario SET nombre = ?, email = ?, rol = ?';
    let params = [nombre, email, rol];

    if (contraseña) {
      const hashedPassword = await bcrypt.hash(contraseña, 10);
      query += ', contraseña = ?';
      params.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await db.execute(query, params);
    res.status(200).json({ message: 'Usuario actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar el usuario' });
  }
};

// Eliminar usuario
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('DELETE FROM usuario WHERE id = ?', [id]);
    res.status(200).json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar el usuario' });
  }
};