const Trabajador = require('../models/trabajador');
const Asistencia = require ("../models/asistencias");
const Falta = require("../models/faltas");
const Permiso = require("../models/permisos");

const QRCode = require("qrcode");

const getP = {

  async profile(req, res) {
    const { cedula } = req.params;

    try {

      //Obtener datos del trabajador
      const trabajador = await Trabajador.obtainByCi(cedula);
      if (!trabajador) {
        return res.status(404).json({ message: "Trabajador no encontrado" });
      }

      //Contadores: Asistencias, Faltas y Permisos

      const asistencias = await Asistencia.countAttendance(trabajador.id_trabajador);

      const faltas = await Falta.countFaults(trabajador.id_trabajador);

      const permisos = await Permiso.countPermission(trabajador.id_trabajador);

      //Obtener eventos para el calendario (asistencias, faltas, permisos)

      const calendario = await getP.calendar(trabajador.id_trabajador);

      //Generar código QR del trabajador
      const qrCode = await QRCode.toDataURL(trabajador.id_trabajador);
      
      //Responder con los datos del perfil
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

  async calendar(id_trabajador) {
    try {
      const asistencias = await Asistencia.getDates(id_trabajador);
      const faltas = await Falta.getDates(id_trabajador);
      const permisos = await Permiso.getDates(id_trabajador); 
  


      const eventos = [
        ...asistencias.map(asistencia => ({
          id: asistencia.id,
          title: "Asistencia",
          start: new Date(asistencia.fecha).toISOString(),
          color: "green"
        })),
        ...faltas.map(falta => ({
          id: falta.id,
          title: "Falta",                               //genera y concatena arrays de objetos, flatmap aplana todos los arrays de days en un unico array permiso resultante
          start: new Date(falta.fecha).toISOString(),
          color: "red"
        })),
      ...permisos.flatMap(permiso => {
        const startDate = new Date(permiso.start);
        const endDate = new Date(permiso.end);
        const days = [];
        
        // Generar un evento por cada día del permiso
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          days.push({
            id: permiso.id,
            title: "Permiso",
            start: new Date(d).toISOString().split('T')[0] + "T00:00:00",
            color: "orange",
            description: permiso.motivo,
            allDay: true,
            extendedProps: {
              esPermiso: true,
              fechaInicio: permiso.start,
              fechaFin: permiso.end
            }
          });
        }
        return days;
      })
    ];
    
    
      return eventos;
    } catch (error) {
      console.error("Error al obtener calendario:", error);
      return [];
    }
  }
};

module.exports = getP;
