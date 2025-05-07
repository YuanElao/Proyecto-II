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
          nombre: trabajador.t_name,
          apellido: trabajador.t_apellido,
          cedula: trabajador.t_cedula,
          id_departamento: trabajador.id_departamento,
          id_cargo: trabajador.id_cargo,
          departamento: trabajador.departamento,
          cargo: trabajador.cargo,
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
        ...asistencias.map(fecha => ({
          title: "Asistencia",
          start: new Date(fecha).toISOString(),
          color: "green"
        })),
        ...faltas.map(fecha => ({
          title: "Falta",
          start: new Date(fecha).toISOString(),
          color: "red"
        })),
        ...permisos.flatMap(({fecha_inicio, fecha_fin, motivo}) => {

          const start = new Date(fecha_inicio);
          const end = new Date(fecha_fin);
          const eventosPermiso = [];

          for(let fecha = new Date(start); fecha <= end; fecha.setDate(fecha.getDate() + 1)) {

          eventosPermiso.push({
          title: "Permiso",
          start: new Date(fecha).toISOString(),
  
          color: "orange",
          description: motivo,
          allDay: true
            });
          
        }
      return eventosPermiso;
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
