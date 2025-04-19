const Trabajador = require("./trabajador");
const Asistencia = require("./asistencias");
const Falta = require("./faltas");
const Permiso = require("./permisos");

class Reporte {
  static async generarReporte(cedula) {
    // Obtener datos del trabajador
    const trabajador = await Trabajador.obtainByCi(cedula);
    if (!trabajador) throw new Error("Trabajador no encontrado");

    // Obtener todas las fechas relevantes
    const [asistencias, faltas, permisos] = await Promise.all([
      Asistencia.getDates(trabajador.id_trabajador),
      Falta.getDates(trabajador.id_trabajador),
      Permiso.getDates(trabajador.id_trabajador)
    ]);

    // Generar estructura del calendario
    const meses = [];
    const añoActual = new Date().getFullYear();

    for (let mes = 0; mes < 12; mes++) {
      const primerDia = new Date(añoActual, mes, 1);
      const ultimoDia = new Date(añoActual, mes + 1, 0);
      
      const diasMes = [];
      for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
        const fechaISO = new Date(añoActual, mes, dia).toISOString().split('T')[0];
        
        let estado = "laborable";
        if (asistencias.includes(fechaISO)) estado = "asistencia";
        if (faltas.includes(fechaISO)) estado = "falta";
        if (permisos.includes(fechaISO)) estado = "permiso";

        diasMes.push({ dia, estado });
      }

      meses.push({
        nombre: primerDia.toLocaleString("es-ES", { month: "long" }),
        año: añoActual,
        dias: diasMes
      });
    }

    return {
      datosTrabajador: {
        nombre: trabajador.t_name,
        apellido: trabajador.t_apellido,
        cedula: trabajador.t_cedula,
        departamento: trabajador.departamento,
        cargo: trabajador.cargo
      },
      contadores: {
        asistencias: asistencias.length,
        faltas: faltas.length,
        permisos: permisos.length
      },
      calendario: meses,
      fechaGeneracion: new Date().toLocaleDateString("es-ES")
    };
  }
}

module.exports = Reporte;