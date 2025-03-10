const Trabajador = require('../models/trabajador');

const register = {

  async worker(req, res) {

    const { tname, tapellido, tcedula } = req.body;

    if (!tname || !tapellido || !tcedula) {
      return res.status(400).json({message: "Todos los campos son obligatorios"});
    }

    try {
      const worker = new Trabajador(tname, tapellido, tcedula);
      const newWorker = await worker.registerWorker();

      res.status(201).json({message: "Trabajador registrado con exito"});

    } catch (error) {

      console.error("Error al registrar trabajador", error);
      res.status(500).json({message: "Error al registrar", error})
    }
  }
};

module.exports = register;
