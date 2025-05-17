const bcrypt = require('bcrypt');
const db = require('../config/db');
const generateToken = require('../reutilizable/generateJWT');

exports.login = async (req, res) => {
  const { email, contraseña } = req.body;

  try {
    const [users] = await db.execute('SELECT * FROM usuario WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(contraseña, user.contraseña);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      rol: user.rol
    });

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.register = async (req, res) => {
  const { nombre, email, contraseña } = req.body;
  const rol = 'cliente';

  try {
    const [existingUsers] = await db.execute('SELECT * FROM usuario WHERE email = ?', [email]);

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'El correo ya está en uso' });
    }

    const hashedPassword = await bcrypt.hash(contraseña, 10);

    const [result] = await db.execute(
      'INSERT INTO usuario (nombre, email, contraseña, rol) VALUES (?, ?, ?, ?)',
      [nombre, email, hashedPassword, rol]
    );

    const token = generateToken({
      idusuario: result.insertId,
      email,
      rol: rol
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        idusuario: result.insertId,
        nombre,
        email,
        rol
      }
    });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ message: 'Error al registrar el usuario' });
  }
};