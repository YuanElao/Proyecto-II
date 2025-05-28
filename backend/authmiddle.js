//Aqui se establece nuestro middleware de autenticacion

const jwt = require('jsonwebtoken'); //se importa jsonwebtoken
const Login = require('./models/login'); //y se importa el modelo login

const authenticateJWT = (role, root) => { //definimos una funcion que recibe 2 parametros

    return (req, res, next) => {

        const token = req.header('Authorization')?.replace('Bearer ', ''); //aqui se intenta obtener de la cabezera autorization el token JWT, se elimina bearer para obtener solo el token

        if (!token) {
            return res.status(401).json({message: 'Token no proporcionado'}); //si no se encuentra el token se retorna un mensaje de error
        }

        jwt.verify(token, Login.JWT_SECRET, {algorithms: ['HS256']}, (err, user) => { //aqui se verifica el token pasandole la clave secreta, el algoritmo y na funcion de call back
            if (err) {
                return res.status(403).json({message: 'Token invalido'});
            }
        
            if (role && user.role !== role){

                return res.status(403).json({message: `Acceso denegado: se requiere el rol ${role}`});
            }

            if (root !== undefined && user.root !== root){

                return res.status(403).json({message: `Acceso denegado: se requiere permisos de nivel ${root}`});
            }
            
            req.user = user; //luego de la verificacion se le asigna al objeto user al objeto req
            next();//Luego de la verificacion se usa next para pasar el control al siguiente middleware o manejador de rutas
        });
    };
};

module.exports = authenticateJWT;