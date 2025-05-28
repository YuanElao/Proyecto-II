const Trabajador = require("../models/trabajador");
const Asistencia = require("../models/asistencias");
const Falta = require("../models/faltas");
const Permiso = require("../models/permisos");
const QRCode = require("qrcode");

// Objeto con métodos para manejar perfiles de trabajadores
const getP = {
  // Método para obtener perfil completo de un trabajador
  async profile(req, res) {
    const { cedula } = req.params;

    try {
      // Obtiene datos básicos del trabajador
      const trabajador = await Trabajador.obtainByCi(cedula);
      if (!trabajador) {
        return res.status(404).json({ message: "Trabajador no encontrado" });
      }

      // Obtiene contadores de eventos
      const asistencias = await Asistencia.countAttendance(
        trabajador.id_trabajador
      );
      const faltas = await Falta.countFaults(trabajador.id_trabajador);
      const permisos = await Permiso.countPermission(trabajador.id_trabajador);

      // Obtiene eventos para el calendario
      const calendario = await getP.calendar(trabajador.id_trabajador);

      // Genera código QR con el ID del trabajador
      const qrCode = await QRCode.toDataURL(trabajador.id_trabajador);

      // Retorna todos los datos estructurados
      return res.status(200).json({
        trabajador: {
          id_trabajador: trabajador.id_trabajador,
          nombre: trabajador.t_name,
          apellido: trabajador.t_apellido,
          cedula: trabajador.t_cedula,
          id_departamento: trabajador.id_departamento,
          id_cargo: trabajador.id_cargo,
          departamento: trabajador.departamento,
          cargo: trabajador.cargo,
          fecha_registro: trabajador.fecha_registro,
          qr_code: qrCode,
        },
        contadores: {
          asistencias,
          faltas,
          permisos,
        },
        calendario,
      });
    } catch (error) {
      console.error("Error al obtener perfil:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  },

  // Método para generar eventos de calendario
  async calendar(id_trabajador) {
    try {
      // Obtiene fechas de asistencias, faltas y permisos
      const asistencias = await Asistencia.getDates(id_trabajador);
      const faltas = await Falta.getDates(id_trabajador);
      const permisos = await Permiso.getDates(id_trabajador);

      // Combina todos los eventos en un solo array
      const eventos = [
        // Mapea asistencias a eventos verdes
        ...asistencias.map((asistencia) => ({
          id: asistencia.id,
          title: "Asistencia",
          start: new Date(asistencia.fecha).toISOString(),
          color: "green",
        })),
        // Mapea faltas a eventos rojos
        ...faltas.map((falta) => ({
          id: falta.id,
          title: "Falta",
          start: new Date(falta.fecha).toISOString(),
          color: "red",
        })),
        // Mapea permisos (genera un evento por cada día)
        ...permisos.flatMap((permiso) => {
          const startDate = new Date(permiso.start);
          const endDate = new Date(permiso.end);
          const days = [];

          // Genera eventos para cada día del permiso
          for (
            let d = new Date(startDate);
            d <= endDate;
            d.setDate(d.getDate() + 1)
          ) {
            days.push({
              id: permiso.id,
              title: "Permiso",
              start: new Date(d).toISOString().split("T")[0] + "T00:00:00",
              color: "orange",
              description: permiso.motivo,
              allDay: true,
              extendedProps: {
                esPermiso: true,
                fechaInicio: permiso.start,
                fechaFin: permiso.end,
              },
            });
          }
          return days;
        }),
      ];

      return eventos;
    } catch (error) {
      console.error("Error al obtener calendario:", error);
      return [];
    }
  },
};

module.exports = getP;
