const Login = require("../models/login");

const authentication = {};

authentication.login = async (req, res) => {

  const {name, password, role} = req.body;

  try{

    const result = await Login.verifyUser({name, password, role});

    if(!result) {

      return res.status(404).json({ message: "Usuario o contraseña incorrectos"});
    }
    const {user, token} = result;

    return res.status(200).json({message: `Bienvenido ${role === "admin" ? "Administrador" : "Secretario"}`, token, user,});
  } catch (error) {
    console.error("Error al iniciar sesion", error);
    return res.status(500).json({
      message: "Error del Servidor", error});
  }
}

module.exports = authentication;
