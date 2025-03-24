const pool = require("../database/keys");
const jwt = require('jsonwebtoken');

class Login {
    constructor() {

        this.JWT_SECRET = "qrassist";
        this.verifyUser = this.verifyUser.bind(this)
        this.generarToken = this.generarToken.bind(this)
    }

    async verifyUser({name, password, role}){
        try {

            let result;

            //Verificamos si el rol es admin o usuario
            if (role === "admin") {

                result = await pool.query("SELECT * FROM login WHERE c_name = $1 AND c_password = $2 AND c_rol = $3", [name, password, role]);

            } else {

                result = await pool.query("SELECT * FROM login WHERE c_name = $1 AND c_password = $2 AND c_rol = $3",[name, password, role]);
            }

            if (result.rows.length === 0) {

                return null; //Usuario no encontrado
            }

            const user = result.rows[0];

            //Usuario encontrado, generamos el JWT

            const payload = {
                role: user.c_rol,
                root: user.c_root === 1, //1 es root, 0 no lo es
            };

            const token = this.generarToken(payload);
            return {token};
        } catch (error) {
            console.error("Error en la consulta: ", error);
            return null;
        }
    }

    //Metodo para generar token JWT
    generarToken(payload) {
        return jwt.sign(payload, this.JWT_SECRET, {expiresIn: "1h", algorithm: 'HS256'})
    }
}

module.exports = new Login();