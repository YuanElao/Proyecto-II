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

  static async obtenerMesesDisponibles(id_trabajador, anio) {
    const query = `
        SELECT DISTINCT EXTRACT(MONTH FROM fecha) as mes 
        FROM (
            SELECT fecha FROM asistencias 
            WHERE id_trabajador = $1 AND EXTRACT(YEAR FROM fecha) = $2
            
            UNION ALL
            
            SELECT fecha FROM faltas 
            WHERE id_trabajador = $1 AND EXTRACT(YEAR FROM fecha) = $2
            
            UNION ALL
            
            SELECT dia as fecha
            FROM (
                SELECT generate_series(
                    fecha_inicio, 
                    fecha_fin, 
                    '1 day'::interval
                )::date as dia
                FROM permisos 
                WHERE id_trabajador = $1 
            ) AS dias_permiso
            WHERE EXTRACT(YEAR FROM dia) = $2
        ) AS fechas
        ORDER BY mes`;

    try {
        const result = await pool.query(query, [id_trabajador, anio]);
        return result.rows.map(row => row.mes - 1); // Convertir a 0-11 para JS
    } catch (error) {
        console.error("Error en obtenerMesesDisponibles:", error);
        throw error;
    }
}

  // Método para obtener el registro de eventos de un trabajador con filtros opcionales
    static async obtenerRecord(id_trabajador, filtros = {}) {
    const { anio, mesInicio = 0, mesFin = 11 } = filtros;
    
    let query = `
      WITH eventos AS (
        SELECT 
          id_a as id, 
          'Asistencia' as tipo, 
          fecha as start, 
          hora, 
          NULL as motivo, 
          'asistencia' as tipo_evento
        FROM asistencias 
        WHERE id_trabajador = $1
        
        UNION ALL
        
        SELECT 
          id_f, 
          'Falta', 
          fecha, 
          NULL, 
          NULL, 
          'falta' 
        FROM faltas 
        WHERE id_trabajador = $1
        
        UNION ALL
        
        SELECT 
          id_p, 
          'Permiso', 
          generate_series(fecha_inicio, fecha_fin, '1 day'::interval)::date as start, 
          NULL, 
          motivo, 
          'permiso' 
        FROM permisos 
        WHERE id_trabajador = $1
      )
      SELECT * FROM eventos 
      WHERE EXTRACT(YEAR FROM start) = $2
      AND EXTRACT(MONTH FROM start) BETWEEN $3 AND $4
      ORDER BY start
      LIMIT 1000`;
    
    const params = [
      id_trabajador,
      anio,
      mesInicio + 1, // PostgreSQL usa meses 1-12
      mesFin + 1
    ];

    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error("Error en obtenerRecord:", error);
      throw error;
    }
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