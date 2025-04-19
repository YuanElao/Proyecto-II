const Trabajador = require("../../models/trabajador");
const Permiso = require("../../models/permisos");
const Asistencia = require("../../models/asistencias");
const Falta = require("../../models/faltas");
const Departamento = require("../../models/departamentos");
const Cargo = require("../../models/cargos");
const Reporte = require("../../models/reportes");

const QRCode = require("qrcode");

const profileAdmin = {

  //Editar trabajador 

  async edit(req, res) {

    const { cedula } = req.params;
    const { nombre, apellido, nuevaCedula, id_departamento, id_cargo } = req.body;

    if (!nombre || !apellido || !nuevaCedula) {

      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    try {

      await Trabajador.editWorker(cedula, nombre, apellido, nuevaCedula, id_departamento, id_cargo);

      res.status(200).json({ message: "Trabajador actualizado correctamente" });

    } catch (error) {

      console.error("Error al actualizar trabajador:", error);

      res.status(400).json({ message: error.message });
    }
  },

  //Eliminar trabajador 
  async delete(req, res) {

    const { cedula } = req.params;

    try {
      await Trabajador.deleteWorker(cedula);

      res.status(200).json({ message: "Trabajador eliminado correctamente" });

    } catch (error) {

      console.error("Error al eliminar trabajador:", error);
      res.status(500).json({ message: "Error al eliminar trabajador" });
    }
  },

  async generateReport(req, res) {
    const { cedula } = req.params;
    try {
      const reporte = await Reporte.generarReporte(cedula);
      res.status(200).json(reporte);
    } catch (error) {
      console.error("Error en reporte:", error);
      res.status(500).json({ 
        message: error.message || "Error al generar el reporte" 
      });
    }
  }

};

module.exports = profileAdmin;