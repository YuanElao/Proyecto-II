const Reporte = require("../../models/reportes.js");

const report = {
  async obtenerAnios(req, res) {
    const { id_trabajador } = req.params;

    try {
      if (!id_trabajador) {
        return res
          .status(400)
          .json({ message: "ID de trabajador es requerido" });
      }

      const anios = await Reporte.obtenerAnios(id_trabajador);
      res.json(anios);
    } catch (error) {
      console.error("Error al obtener años disponibles:", error);
      res.status(500).json({
        message: "Error al obtener los años disponibles",
        error: error.message,
      });
    }
  },

  async obtenerMesesDisponibles(req, res) {
    const { id_trabajador } = req.params;
    const { anio } = req.params;

    try {
      if (!id_trabajador || !anio) {
        return res.status(400).json({ 
          message: "ID de trabajador y año son requeridos" 
        });
      }

      const meses = await Reporte.obtenerMesesDisponibles(id_trabajador, parseInt(anio));
      res.json(meses);
    } catch (error) {
      console.error("Error al obtener meses disponibles:", error);
      res.status(500).json({ 
        message: "Error al obtener meses",
        error: error.message 
      });
    }
  },


  async obtenerDatosReporte(req, res) {
    const { id_trabajador } = req.params;
    const { anio, mesInicio, mesFin } = req.query;

    try {
      if (!id_trabajador || !anio) {
        return res.status(400).json({ 
          message: "ID de trabajador y año son requeridos" 
        });
      }

      // Convertir a números y validar meses
      const inicio = parseInt(mesInicio) || 0;
      const fin = parseInt(mesFin) || 11;
      
      if (inicio < 0 || fin > 11 || inicio > fin) {
        return res.status(400).json({ 
          message: "Rango de meses inválido (0-11, mesInicio <= mesFin)" 
        });
      }

      const eventos = await Reporte.obtenerRecord(id_trabajador, {
        anio: parseInt(anio),
        mesInicio: inicio,
        mesFin: fin
      });

      res.json(eventos);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      res.status(500).json({ 
        message: "Error al generar el reporte",
        error: error.message 
      });
    }
  },

  // Métodos para reportes de departamento
async obtenerAniosDepartamento(req, res) {
    const { departamento } = req.params;

    try {
        const anios = await Reporte.obtenerAniosPorDepartamento(departamento);
        res.json(anios);
    } catch (error) {
        console.error("Error al obtener años del departamento:", error);
        res.status(500).json({ message: "Error al obtener años", error: error.message });
    }
},

async obtenerMesesDepartamento(req, res) {
    const { departamento, anio } = req.params;

    try {
        const meses = await Reporte.obtenerMesesPorDepartamento(departamento, parseInt(anio));
        res.json(meses);
    } catch (error) {
        console.error("Error al obtener meses del departamento:", error);
        res.status(500).json({ message: "Error al obtener meses", error: error.message });
    }
},

async obtenerDatosDepartamento(req, res) {
    const { departamento } = req.params;
    const { anio, mesInicio, mesFin } = req.query;

    try {
        const inicio = parseInt(mesInicio) || 0;
        const fin = parseInt(mesFin) || 11;
        
        const eventos = await Reporte.obtenerRecordDepartamento(departamento, {
            anio: parseInt(anio),
            mesInicio: inicio,
            mesFin: fin
        });

        res.json(eventos);
    } catch (error) {
        console.error("Error al obtener datos del departamento:", error);
        res.status(500).json({ message: "Error al generar reporte", error: error.message });
    }
  },

  // Obtener años generales
  async obtenerAniosGenerales(req, res) {
    try {
      const anios = await Reporte.obtenerAniosGenerales();
      res.json(anios);
    } catch (error) {
      console.error("Error al obtener años generales:", error);
      res.status(500).json({
        message: "Error al obtener los años disponibles",
        error: error.message,
      });
    }
  },

  // Eliminar por año
  async eliminarPorAnio(req, res) {
    const { anio } = req.params;

    try {
      if (!anio) {
        return res.status(400).json({ 
          message: "El año es requerido" 
        });
      }

      const resultado = await Reporte.eliminarPorAnio(anio);
      
      if (resultado) {
        res.json({ 
          success: true, 
          message: `Reportes del año ${anio} eliminados correctamente` 
        });
      }
    } catch (error) {
      console.error("Error al eliminar reportes:", error);
      res.status(500).json({ 
        message: "Error al eliminar reportes", 
        error: error.message 
      });
    }
  }
};

module.exports = report;
