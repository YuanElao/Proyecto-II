const pool = require("../database/keys");

// Clase Reporte que contiene métodos estáticos para manejar reportes
class Reporte {
  // Método para obtener los años disponibles de registros de un trabajador
  static async obtenerAnios(id_trabajador) {
    // Query que obtiene años distintos de asistencias, faltas y permisos
    const query = `
      SELECT DISTINCT EXTRACT(YEAR FROM fecha) as anio 
      FROM (
        SELECT fecha FROM asistencias WHERE id_trabajador = $1
        UNION SELECT fecha FROM faltas WHERE id_trabajador = $1
        UNION SELECT fecha_inicio as fecha FROM permisos WHERE id_trabajador = $1
      ) AS fechas ORDER BY anio DESC`;

    // Ejecuta la query con el parámetro id_trabajador
    const result = await pool.query(query, [id_trabajador]);
    // Retorna un array con los años
    return result.rows.map((row) => row.anio);
  }

  // Método para obtener el registro de eventos de un trabajador con filtros opcionales
  static async obtenerRecord(id_trabajador, filtros = {}) {
    // Extrae tipo y año de los filtros
    const { tipo, anio } = filtros;
    // Query base que une asistencias, faltas y permisos en una tabla temporal 'eventos'
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

    // Parámetros iniciales (siempre incluye id_trabajador)
    const params = [id_trabajador];
    const conditions = [];
    let paramIndex = 2;

    // Añade condición de filtro por año si existe
    if (anio) {
      conditions.push(`EXTRACT(YEAR FROM start) = $${paramIndex++}`);
      params.push(parseInt(anio));
    }

    // Añade condición de filtro por tipo si existe y no es "general"
    if (tipo && tipo !== "general") {
      const tipoMap = {
        asistencias: "Asistencia",
        faltas: "Falta",
        permisos: "Permiso",
      };
      conditions.push(`tipo = $${paramIndex++}`);
      params.push(tipoMap[tipo]);
    }

    // Construye la query final con las condiciones
    query += conditions.length ? ` AND ${conditions.join(" AND ")}` : "";
    // Ordena por fecha y limita a 1000 registros
    query += " ORDER BY start LIMIT 1000";

    // Ejecuta la query y retorna los resultados
    const result = await pool.query(query, params);
    return result.rows;
  }

  // Método para obtener años disponibles de TODOS los registros (sin filtrar por trabajador)
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

  // Método para eliminar registros por año (asistencias, faltas y permisos)
  static async eliminarPorAnio(anio) {
    try {
      // Inicia transacción
      await pool.query('BEGIN');
      
      // Elimina asistencias del año especificado
      await pool.query(
        `DELETE FROM asistencias WHERE EXTRACT(YEAR FROM fecha) = $1`,
        [anio]
      );
      
      // Elimina faltas del año especificado
      await pool.query(
        `DELETE FROM faltas WHERE EXTRACT(YEAR FROM fecha) = $1`,
        [anio]
      );
      
      // Elimina permisos que comenzaron en el año especificado
      await pool.query(
        `DELETE FROM permisos WHERE EXTRACT(YEAR FROM fecha_inicio) = $1`,
        [anio]
      );
      
      // Confirma la transacción si todo salió bien
      await pool.query('COMMIT');
      return true;
    } catch (error) {
      // Revierte la transacción en caso de error
      await pool.query('ROLLBACK');
      throw error;
    }
  }
}

module.exports = Reporte;