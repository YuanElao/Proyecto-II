const pool = require("../database/keys");
const QRcode = require("qrcode");

// Obtener datos básicos del trabajador
const getW = async (cedula) => {
  const result = await pool.query(
    `SELECT id_trabajador, t_name, t_apellido, t_cedula FROM trabajadores WHERE t_cedula = $1;`,
    [cedula]
  );

  if (result.rows.length === 0) {
    console.log("Trabajador no encontrado");
  }

  return result.rows[0];
};

// Obtener contadores de asistencias, faltas y permisos
const getCount = async (id_trabajador) => {
  const result = await pool.query(
    `SELECT 
         COUNT(DISTINCT a.fecha) AS dias_asistidos,
         COUNT(DISTINCT f.fecha) AS dias_faltas,
         COUNT(DISTINCT p.fecha_inicio) AS dias_permisos
    FROM trabajadores t
        LEFT JOIN 
            asistencias a ON t.id_trabajador = a.id_trabajador
        LEFT JOIN 
            faltas f ON t.id_trabajador = f.id_trabajador
        LEFT JOIN 
            permisos p ON t.id_trabajador = p.id_trabajador
        WHERE 
            t.id_trabajador = $1
        GROUP BY 
            t.id_trabajador;
        `,
    [id_trabajador]
  );

  if (result.rows.length === 0) {
    throw new Error("No se encontraron datos para los contadores");
  }

  return result.rows[0];
};

// Obtener datos del calendario
const getCalendar = async (id_trabajador) => {
  const result = await pool.query(
    `SELECT 
        COALESCE(JSON_AGG(a.fecha ORDER BY a.fecha) FILTER (WHERE a.fecha IS NOT NULL), '[]') AS days_assist,
        COALESCE(JSON_AGG(f.fecha ORDER BY f.fecha) FILTER (WHERE f.fecha IS NOT NULL), '[]') AS days_fault,
        COALESCE(JSON_AGG(p.fecha_inicio ORDER BY p.fecha_inicio) FILTER (WHERE p.fecha_inicio IS NOT NULL), '[]') AS days_permission
    FROM 
        trabajadores t
    LEFT JOIN 
        asistencias a ON t.id_trabajador = a.id_trabajador
    LEFT JOIN 
        faltas f ON t.id_trabajador = f.id_trabajador
    LEFT JOIN 
        permisos p ON t.id_trabajador = p.id_trabajador
    WHERE 
        t.id_trabajador = $1
    GROUP BY 
        t.id_trabajador;`,
    [id_trabajador]
  );

  if (result.rows.length === 0) {
    return { calendar: [] }; // Devolver array vacío si no hay registros
  }

  const calendar = result.rows[0];

  // Convertir valores nulos a arrays vacíos
  const daysAssist = calendar.days_assist || [];
  const daysFault = calendar.days_fault || [];
  const daysPermission = calendar.days_permission || [];

  // Crear eventos en el formato de FullCalendar
  const events = [];

  daysAssist.forEach((fecha) => {
    events.push({ title: "Asistencia", start: fecha, color: "green" });
  });

  daysFault.forEach((fecha) => {
    events.push({ title: "Falta", start: fecha, color: "red" });
  });

  daysPermission.forEach((fecha) => {
    events.push({ title: "Permiso", start: fecha, color: "yellow" });
  });

  return { calendar: events };}

// Generar código QR
const getQR = (id_trabajador) => {
  return new Promise((resolve, reject) => {
    QRcode.toDataURL(id_trabajador, (err, url) => {
      if (err) {
        return reject(err);
      }
      resolve(url);
    });
  });
};

// Controlador Principal
const getP = async (req, res) => {
  const { cedula } = req.params;

  try {
    // Obtener datos básicos del trabajador
    const worker = await getW(cedula);

    // Obtener contadores
    const count = await getCount(worker.id_trabajador);

    // Obtener datos del calendario
    const calendar = await getCalendar(worker.id_trabajador);

    // Generar código QR
    const qrCode = await getQR(worker.id_trabajador);

    // Respuesta final
    return res.status(200).json({
      trabajador: {
        id_trabajador: worker.id_trabajador,
        nombre: worker.t_name,
        apellido: worker.t_apellido,
        cedula: worker.t_cedula,
        qr_code: qrCode,
      },
      count, // Totales de asistencias, faltas y permisos
      calendar, // Eventos del calendario
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getP
};
