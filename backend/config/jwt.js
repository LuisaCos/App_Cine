const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403); 
            }
            req.user = user; // Información del usuario almacenada en la solicitud.
            next();
        });
    } else {
        res.sendStatus(401); 
    }
};

module.exports = authenticateJWT;