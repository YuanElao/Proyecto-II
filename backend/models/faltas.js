const pool = require("../database/keys");

class Falta {
  constructor(tId) {
    this.tId = tId;

    this.validationF = this.validationF.bind(this);
    this.reFault = this.reFault.bind(this);
  }

  async validationF() {
    const result = await pool.query(
      `SELECT 
            (SELECT COUNT(*) FROM asistencias WHERE id_trabajador = $1 AND fecha = CURRENT_DATE) AS asistencia,
            (SELECT COUNT(*) FROM faltas WHERE id_trabajador = $1 AND fecha = CURRENT_DATE) AS falta,
            (SELECT COUNT(*) FROM permisos WHERE id_trabajador = $1 AND CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin) AS permiso`,
      [this.tId]
    );

    const { asistencia, falta, permiso } = result.rows[0];

    if (asistencia > 0)
      return { valido: false, message: "El trabajador ya asistió hoy" };
    if (falta > 0)
      return {
        valido: false,
        message: "El trabajador ya tiene una falta registrada",
      };
    if (permiso > 0)
      return {
        valido: false,
        message: "El trabajador tiene un permiso activo",
      };

    return { valido: true };
  }

  async reFault() {
    await pool.query(
      "INSERT INTO faltas (id_trabajador, fecha) VALUES ($1, CURRENT_DATE)",
      [this.tId]
    );
  }

  static async countFaults(id_trabajador) {
    const result = await pool.query(
      "SELECT COUNT(*) AS total FROM faltas WHERE id_trabajador = $1 AND EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM CURRENT_DATE)",
      [id_trabajador]
    );
    return result.rows[0].total;
  }

  static async getDates(id_trabajador) {
    const result = await pool.query(
      "SELECT id_f, fecha FROM faltas WHERE id_trabajador = $1 AND EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM CURRENT_DATE) ORDER BY fecha",
      [id_trabajador]
    );
    return result.rows.map((row) => ({
      id: row.id_f,
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
    const falta = new Falta(id_trabajador);

    const validation = await falta.validationForDate(fecha);
    if (!validation.valido) {
      throw new Error(validation.message);
    }

    await pool.query(
      "INSERT INTO faltas (id_trabajador, fecha) VALUES ($1, $2)",
      [id_trabajador, fecha]
    );

    return { message: "Falta creada correctamente" };
  }

  static async delete(id_f) {
    await pool.query("DELETE FROM faltas WHERE id_f = $1", [id_f]);
  }
}

module.exports = Falta;
