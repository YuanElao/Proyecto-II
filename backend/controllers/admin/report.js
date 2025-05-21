const Reporte = require('../../models/reportes.js');

const report = {
  async obtenerAnios(req, res) {
    const { id_trabajador } = req.params;
    
    try {
      if (!id_trabajador) {
        return res.status(400).json({ message: 'ID de trabajador es requerido' });
      }
      
      const anios = await Reporte.obtenerAnios(id_trabajador);
      res.json(anios);
    } catch (error) {
      console.error('Error al obtener años disponibles:', error);
      res.status(500).json({ 
        message: 'Error al obtener los años disponibles',
        error: error.message 
      });
    }
  },

  async obtenerDatosReporte(req, res) {
    const { id_trabajador } = req.params;
    const { tipo, anio, rango } = req.query;

    try {
      if (!id_trabajador) {
        return res.status(400).json({ message: 'ID de trabajador es requerido' });
      }

      // Preparar filtros
      const filtros = { tipo };
      
      if (anio) {
        filtros.anio = parseInt(anio);
        
        // Si es el año actual y hay rango, procesarlo
        const currentYear = new Date().getFullYear();
        if (rango && parseInt(anio) === currentYear) {
          const currentMonth = new Date().getMonth() + 1;
          
          switch(rango) {
            case 'mensual':
              filtros.mes = currentMonth;
              break;
            case 'trimestral':
              filtros.trimestre = Math.ceil(currentMonth / 3);
              break;
            case 'semestral':
              filtros.semestre = Math.ceil(currentMonth / 6);
              break;
          }
        }
      }

      const eventos = await Reporte.obtenerRecord(id_trabajador, filtros);
      res.json(eventos);

    } catch (error) {
      console.error('Error al obtener datos para reporte:', error);
      res.status(500).json({ 
        message: 'Error al obtener datos para el reporte',
        error: error.message 
      });
    }
  }
};

module.exports = report;