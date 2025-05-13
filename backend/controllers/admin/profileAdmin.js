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


  //Crear Asistencia

async createA(req, res) {
    const { id_trabajador, fecha } = req.body;
    
    try {
        const resultado = await Asistencia.create(id_trabajador, fecha);
        res.status(201).json(resultado);
    } catch (error) {
        console.error("Error al registrar asistencia:", error);
        res.status(400).json({ 
            message: error.message || "Error al registrar asistencia" 
        });
    }
},

//Crear Falta

async createF(req, res) {
    const { id_trabajador, fecha } = req.body;
    
    try {
        const resultado = await Falta.create(id_trabajador, fecha);
        res.status(201).json(resultado);
    } catch (error) {
        console.error("Error al registrar falta:", error);
        res.status(400).json({ 
            message: error.message || "Error al registrar falta" 
        });
    }
},

  //Crear Permiso

  async createP(req,res){
    const {cedula, fecha_inicio, fecha_fin, motivo} = req.body;

    try {

      const permiso = new Permiso(cedula, fecha_inicio, fecha_fin, motivo);
      const id_trabajador = await permiso.validationP();
      await permiso.rePermission(id_trabajador);

      res.status(201).json({
        message: "Permiso creado correctamente"
      });
    } catch (error) {
      res.status(400).json({
        message: error.message
      });
    }
  },

  //Eliminar Asistencia 
  async deleteA(req, res) {

    const { id_a } = req.body;

    try {
      await Asistencia.delete(id_a);

      res.status(200).json({ message: "Asistencia eliminada correctamente" });

    } catch (error) {

      console.error("Error al eliminar asistencia:", error);
      res.status(500).json({ message: "Error al eliminar asistencia" });
    }
  },

  //Eliminar Falta
    async deleteF(req, res) {

    const { id_f } = req.body;

    try {
      await Falta.delete(id_f);

      res.status(200).json({ message: "Falta eliminada correctamente" });

    } catch (error) {

      console.error("Error al eliminar falta:", error);
      res.status(500).json({ message: "Error al eliminar falta" });
    }
  },

  async deleteP(req, res) {

    const { id_p } = req.body;

    try {
      await Permiso.delete(id_p);

      res.status(200).json({ message: "Permiso eliminado correctamente" });

    } catch (error) {

      console.error("Error al eliminar permiso:", error);
      res.status(500).json({ message: "Error al eliminar permiso" });
    }
  },

  async updateP(req, res) {
    const {id_p, motivo} = req.body;

    try {
        await Permiso.update(id_p, motivo);
        res.status(200).json({
          message: "Permiso actualizado correctamente"
        })

    } catch (error) {
        res.status(400).json({
          message: error.message
        });
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