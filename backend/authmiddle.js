const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./models/login');

const authenticateJWT = (role, root) => {

    return (req, res, next) => {

        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({message: 'Token no proporcionado'});
        }

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({message: 'Token invalido'});
            }
        
            if (role && user.role !== role){

                return res.status(403).json({message: `Acceso denegado: se requiere el rol ${role}`});
            }

            if (root !== undefined && user.root !== root){

                return res.status(403).json({message: `Acceso denegado: se requiere permisos de nivel ${root}`});
            }
            req.user = user;
            next();
        });
    };
};

module.exports = authenticateJWT;