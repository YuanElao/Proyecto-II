const pool = require("../database/keys");

class Asistencia {
    constructor (tId) {
        this.tId = tId;
    }
    
    async validationA() {

        const result = await pool.query(`SELECT 
            (SELECT COUNT(*) FROM trabajadores WHERE id_trabajador = $1) AS existe,
            (SELECT COUNT(*) FROM asistencias WHERE id_trabajador = $1 AND fecha = CURRENT_DATE) AS asistencia,
            (SELECT COUNT(*) FROM permisos WHERE id_trabajador = $1 AND CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin) AS permiso,
            (SELECT COUNT(*) FROM faltas WHERE id_trabajador = $1 AND fecha = CURRENT_DATE) AS falta`,
        [this.tId]);
        
        const { existe, asistencia, permiso, falta} = result.rows[0];

        if (existe == 0) return { valido: false, message: "El trabajador no existe"};
        if (asistencia > 0) return { valido: false, message: "Asistencia ya registrada hoy"};
        if (permiso > 0) return { valido: false, message: "No se puede registrar: tiene un permiso activo"};
        if (falta > 0) return { valido: false, message: "No se puede registrar: falta ya registrada hoy"};

        return {valido: true};
    }

    async reAttendance() {
        await pool.query("INSERT INTO asistencias (id_trabajador, fecha, hora) VALUES ($1, CURRENT_DATE, CURRENT_TIME)", [this.tId]);
    }
}

module.exports = Asistencia