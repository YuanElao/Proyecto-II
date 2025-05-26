const pool = require("../database/keys");

class Reporte {
  static async obtenerAnios(id_trabajador) {
    const query = `
      SELECT DISTINCT EXTRACT(YEAR FROM fecha) as anio 
      FROM (
        SELECT fecha FROM asistencias WHERE id_trabajador = $1
        UNION SELECT fecha FROM faltas WHERE id_trabajador = $1
        UNION SELECT fecha_inicio as fecha FROM permisos WHERE id_trabajador = $1
      ) AS fechas ORDER BY anio DESC`;

    const result = await pool.query(query, [id_trabajador]);
    return result.rows.map((row) => row.anio);
  }

  static async obtenerRecord(id_trabajador, filtros = {}) {
    const { tipo, anio } = filtros;
    let query = `
      WITH eventos AS (
        SELECT id_a as id, 'Asistencia' as tipo, fecha as start, hora, NULL as motivo, 'asistencia' as tipo_evento
        FROM asistencias WHERE id_trabajador = $1
        UNION ALL
        SELECT id_f, 'Falta', fecha, NULL, NULL, 'falta' FROM faltas WHERE id_trabajador = $1
        UNION ALL
        SELECT id_p, 'Permiso', generate_series(fecha_inicio, fecha_fin, '1 day'::interval)::date as start, NULL, motivo, 'permiso' FROM permisos WHERE id_trabajador = $1
      )
      SELECT * FROM eventos WHERE 1=1`;

    const params = [id_trabajador];
    const conditions = [];
    let paramIndex = 2;

    // Filtros
    if (anio) {
      conditions.push(`EXTRACT(YEAR FROM start) = $${paramIndex++}`);
      params.push(parseInt(anio));
    }



    if (tipo && tipo !== "general") {
      const tipoMap = {
        asistencias: "Asistencia",
        faltas: "Falta",
        permisos: "Permiso",
      };
      conditions.push(`tipo = $${paramIndex++}`);
      params.push(tipoMap[tipo]);
    }

    // Ordenar y limitar resultados
    query += conditions.length ? ` AND ${conditions.join(" AND ")}` : "";
    query += " ORDER BY start LIMIT 1000";

    const result = await pool.query(query, params);
    return result.rows;
  }
  // Método para obtener años disponibles de TODOS los registros
  static async obtenerAniosGenerales() {
    const query = `
      SELECT DISTINCT EXTRACT(YEAR FROM fecha) as anio 
      FROM (
        SELECT fecha FROM asistencias
        UNION SELECT fecha FROM faltas
        UNION SELECT fecha_inicio as fecha FROM permisos
      ) AS fechas 
      ORDER BY anio DESC`;
    
    const result = await pool.query(query);
    return result.rows.map((row) => row.anio);
  }

  // Método para eliminar registros por año
  static async eliminarPorAnio(anio) {
    try {
      await pool.query('BEGIN');
      
      await pool.query(
        `DELETE FROM asistencias WHERE EXTRACT(YEAR FROM fecha) = $1`,
        [anio]
      );
      
      await pool.query(
        `DELETE FROM faltas WHERE EXTRACT(YEAR FROM fecha) = $1`,
        [anio]
      );
      
      await pool.query(
        `DELETE FROM permisos WHERE EXTRACT(YEAR FROM fecha_inicio) = $1`,
        [anio]
      );
      
      await pool.query('COMMIT');
      return true;
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  }
}

module.exports = Reporte;
