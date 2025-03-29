const Trabajador = require('../models/trabajador');

const worker = {

  async register(req, res) {

    const { tname, tapellido, tcedula, id_departamento, id_cargo } = req.body;

    if (!tname || !tapellido || !tcedula || !id_departamento || !id_cargo) {
      return res.status(400).json({message: "Todos los campos son obligatorios"});
    }

    const validarTexto = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s'-]+$/;

    if(!validarTexto.test(tname)) {
      return res.status(400).json({message: "El nombre no puede contener numeros o caracteres especiales"});
    }

    if(!validarTexto.test(tapellido)) {
      return res.status(400).json({message: "El apellido no puede contener numeros o caracteres especiales"});
    }

    try {
      const workman = new Trabajador(tname, tapellido, tcedula, id_departamento, id_cargo);
      const newWorkman = await workman.registerWorker();
      console.log("Trabajador registrado con exito")
      res.status(201).json({message: "Trabajador registrado con exito"});

    } catch (error) {

      console.error("Error al registrar trabajador", error);
      res.status(500).json({message: "Error al registrar", error})
    }
  }
};

module.exports = worker;
