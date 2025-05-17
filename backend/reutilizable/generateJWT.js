const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  // user es el objeto donde se guardarán los datos del payload
  const payload = {
    idusuario: user.idusuario,
    email: user.email,
    rol: user.rol,
    nombre: user.nombre 
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

module.exports = generateToken;

