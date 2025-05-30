const pool = require("../database/keys");
const jwt = require("jsonwebtoken");


class Login {
  constructor() {
    this.JWT_SECRET = "qrassist"; // Clave secreta para firmar tokens
    this.verifyUser = this.verifyUser.bind(this);
    this.generarToken = this.generarToken.bind(this);
  }

  // Método para verificar credenciales y generar token
  async verifyUser({ name, password }) {
    try {
      let result;

      // Busca el usuario en la base de datos
      result = await pool.query(
        "SELECT * FROM login WHERE c_name = $1 AND c_password = $2",
        [name, password]
      );

      if (result.rows.length === 0) {
        return null; // Usuario no encontrado
      }

      const user = result.rows[0];

      // Prepara el payload del token JWT
      const payload = {
        id: user.c_id,      // ID del usuario
        role: user.c_rol,   // Rol (admin/user)
        root: user.c_root,  // Flag de superadmin
      };

      // Genera y retorna el token
      const token = this.generarToken(payload);
      return { token };
    } catch (error) {
      console.error("Error en la consulta: ", error);
      return null;
    }
  }

  // Método para generar token JWT con configuración
  generarToken(payload) {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: "1h",    // Token expira en 1 hora
      algorithm: "HS256", // Algoritmo de encriptación
    });
  }
}


module.exports = new Login();
