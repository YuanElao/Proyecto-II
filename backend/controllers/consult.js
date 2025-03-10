const Trabajador = require("../models/trabajador")

const getW = {

  // Obtener la lista completa de trabajadores

  async list(req, res) {
    try {
      const trabajadores = await Trabajador.listWorkers();
      res.status(200).json(trabajadores);
    } catch (error) {
      console.error("Error al obtener la lista de trabajadores:", error);
      res.status(500).json({ message: "Error al obtener la lista de trabajadores" });
    }
  },

  // Buscar trabajadores con un término de búsqueda
  async search(req, res) {
    const { search } = req.query;

    if (!search) {
      return res.status(400).json({ message: "El parámetro 'search' es requerido" });
    }

    try {
      const trabajadores = await Trabajador.searchWorker(search);
      res.status(200).json(trabajadores);
    } catch (error) {
      console.error("Error al buscar trabajador:", error);
      res.status(500).json({ message: "Error al buscar trabajador" });
    }
  }
};


module.exports = getW;
