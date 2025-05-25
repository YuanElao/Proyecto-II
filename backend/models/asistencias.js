const pool = require("../database/keys");

class Asistencia {
  constructor(tId) {
    this.tId = tId;
  }

  async validationA() {
    const result = await pool.query(
      `SELECT 
            (SELECT COUNT(*) FROM trabajadores WHERE id_trabajador = $1) AS existe,
            (SELECT COUNT(*) FROM asistencias WHERE id_trabajador = $1 AND fecha = CURRENT_DATE) AS asistencia,
            (SELECT COUNT(*) FROM permisos WHERE id_trabajador = $1 AND CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin) AS permiso,
            (SELECT COUNT(*) FROM faltas WHERE id_trabajador = $1 AND fecha = CURRENT_DATE) AS falta`,
      [this.tId]
    );

    const { existe, asistencia, permiso, falta } = result.rows[0];

    if (existe == 0)
      return { valido: false, message: "El trabajador no existe" };
    if (asistencia > 0)
      return { valido: false, message: "Asistencia ya registrada hoy" };
    if (permiso > 0)
      return {
        valido: false,
        message: "No se puede registrar: tiene un permiso activo",
      };
    if (falta > 0)
      return {
        valido: false,
        message: "No se puede registrar: falta ya registrada hoy",
      };

    return { valido: true };
  }

  async reAttendance() {
    await pool.query(
      "INSERT INTO asistencias (id_trabajador, fecha, hora) VALUES ($1, CURRENT_DATE, CURRENT_TIME)",
      [this.tId]
    );
  }

  static async countAttendance(id_trabajador) {
    const result = await pool.query(
      "SELECT COUNT(*) AS total FROM asistencias WHERE id_trabajador = $1 AND EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM CURRENT_DATE)",
      [id_trabajador]
    );
    return result.rows[0].total;
  }

  static async getDates(id_trabajador) {
    const result = await pool.query(
      "SELECT id_a, fecha FROM asistencias WHERE id_trabajador = $1 AND EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM CURRENT_DATE) ORDER BY fecha",
      [id_trabajador]
    );
    return result.rows.map((row) => ({
      id: row.id_a,
      fecha: row.fecha.toISOString().split("T")[0],
    }));
  }

  async validationForDate(fecha) {
    const result = await pool.query(
      `SELECT 
        (SELECT COUNT(*) FROM trabajadores WHERE id_trabajador = $1) AS existe,
        (SELECT COUNT(*) FROM asistencias WHERE id_trabajador = $1 AND fecha = $2) AS asistencia,
        (SELECT COUNT(*) FROM permisos WHERE id_trabajador = $1 AND $2 BETWEEN fecha_inicio AND fecha_fin) AS permiso,
        (SELECT COUNT(*) FROM faltas WHERE id_trabajador = $1 AND fecha = $2) AS falta`,
      [this.tId, fecha]
    );

    // Misma lógica de validación pero para la fecha específica
    const { existe, asistencia, permiso, falta } = result.rows[0];

    if (existe == 0)
      return { valido: false, message: "El trabajador no existe" };
    if (asistencia > 0)
      return {
        valido: false,
        message: "Asistencia ya registrada en esta fecha",
      };
    if (permiso > 0)
      return {
        valido: false,
        message: "Existe un permiso activo para esta fecha",
      };
    if (falta > 0)
      return { valido: false, message: "Falta ya registrada en esta fecha" };

    return { valido: true };
  }

  static async create(id_trabajador, fecha) {
    const asistencia = new Asistencia(id_trabajador);

    const validation = await asistencia.validationForDate(fecha);
    if (!validation.valido) {
      throw new Error(validation.message);
    }

    await pool.query(
      "INSERT INTO asistencias (id_trabajador, fecha, hora) VALUES ($1, $2, CURRENT_TIME)",
      [id_trabajador, fecha]
    );

    return { message: "Asistencia creada correctamente" };
  }

  static async delete(id_a) {
    await pool.query("DELETE FROM asistencias WHERE id_a = $1", [id_a]);
  }
}

module.exports = Asistencia;
