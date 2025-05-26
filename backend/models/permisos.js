const pool = require("../database/keys");

class Permiso {
  constructor(tCedula, fecha_inicio, fecha_fin, motivo) {
    this.tCedula = tCedula;
    this.fecha_inicio = fecha_inicio;
    this.fecha_fin = fecha_fin;
    this.motivo = motivo;
  }

  async validationP() {
    try {
      const result = await pool.query(
        `SELECT 
          (SELECT id_trabajador FROM trabajadores WHERE t_cedula = $1) AS id_trabajador,
          (SELECT COUNT(*) FROM asistencias WHERE id_trabajador = (SELECT id_trabajador FROM trabajadores WHERE t_cedula = $1) 
           AND fecha BETWEEN $2 AND $3) AS asistencias,
          (SELECT COUNT(*) FROM faltas WHERE id_trabajador = (SELECT id_trabajador FROM trabajadores WHERE t_cedula = $1) 
           AND fecha BETWEEN $2 AND $3) AS faltas,
          (SELECT COUNT(*) FROM permisos WHERE id_trabajador = (SELECT id_trabajador FROM trabajadores WHERE t_cedula = $1) 
           AND (fecha_inicio <= $3 AND fecha_fin >= $2)) AS permisos`,
        [this.tCedula, this.fecha_inicio, this.fecha_fin]
      );

      const { id_trabajador, asistencias, faltas, permisos } = result.rows[0];

      if (!id_trabajador) throw new Error("El trabajador no existe");
      if (asistencias > 0)
        throw new Error("Hay asistencia(s) en el rango de fechas");
      if (faltas > 0) throw new Error("Hay falta(s) en el rango de fechas");
      if (permisos > 0)
        throw new Error("Ya existe un permiso en el rango de fechas");

      return id_trabajador; // Devuelve el ID del trabajador si todo está validado
    } catch (error) {
      throw error;
    }
  }

  async rePermission(id_trabajador) {
    await pool.query(
      "INSERT INTO permisos (id_trabajador, fecha_inicio, fecha_fin, motivo) VALUES ($1, $2, $3, $4)",
      [id_trabajador, this.fecha_inicio, this.fecha_fin, this.motivo]
    );
  }

  static async countPermission(id_trabajador) {
    const result = await pool.query(
      "SELECT COUNT(*) AS total FROM permisos WHERE id_trabajador = $1 AND EXTRACT(YEAR FROM fecha_inicio) = EXTRACT(YEAR FROM CURRENT_DATE)",
      [id_trabajador]
    );
    return result.rows[0].total;
  }

  static async getDates(id_trabajador) {
    const result = await pool.query(
      `SELECT id_p, fecha_inicio, fecha_fin, motivo FROM permisos WHERE id_trabajador = $1 AND (EXTRACT(YEAR FROM fecha_inicio) = EXTRACT(YEAR FROM CURRENT_DATE) OR EXTRACT(YEAR FROM fecha_fin) = EXTRACT(YEAR FROM CURRENT_DATE)) ORDER BY fecha_inicio`,
      [id_trabajador]
    );

    return result.rows.map((row) => ({
      id: row.id_p,
      start: row.fecha_inicio.toISOString().split("T")[0],
      end: row.fecha_fin.toISOString().split("T")[0],
      motivo: row.motivo,
    }));
  }

  static async update(id_p, motivo) {
    try {
      await pool.query("UPDATE permisos SET motivo = $1 WHERE id_p = $2", [
        motivo,
        id_p,
      ]);
    } catch (error) {
      throw error;
    }
  }

  static async delete(id_p) {
    await pool.query("DELETE FROM permisos WHERE id_p = $1", [id_p]);
  }
}

module.exports = Permiso;
