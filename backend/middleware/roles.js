const checkRole = (roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ message: 'No autenticado' });
      }
  
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'No autorizado para esta acción' });
      }
  
      next();
    };
  };
  
  module.exports = {
    isAdmin: checkRole(['admin']),
    isCashier: checkRole(['admin', 'cajero']),
    isClient: checkRole(['admin', 'cajero', 'cliente'])
  };