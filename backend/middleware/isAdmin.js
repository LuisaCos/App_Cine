module.exports = (req, res, next) => {
  if (req.user?.rol !== 'administrador') {
    return res.status(403).json({ message: 'Acceso denegado: solo para administradores' });
  }
  next();
};
