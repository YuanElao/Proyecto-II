const pool = require ('../../database/keys')

const permissionRegister = async (req, res) =>{
    const {tCedula, fecha_inicio, fecha_fin, motivo} = req.body;
    try {
        //Verificacion de campos

        if (!tCedula || !fecha_inicio || !fecha_fin || !motivo) {
            return res.status(400).json({message: 'Todos los campos son obligatorios'});
        }

        if  (new Date(fecha_inicio) > new Date(fecha_fin)) {
            return res.status(400).json({message: 'La fecha inicial no puede ser mayor que la fecha final'});
        }

        //Verificar si el trabajador existe

        const tResult = await pool.query('SELECT id_trabajador FROM trabajadores WHERE t_cedula = $1', [tCedula]);
        if (tResult.rows.length === 0) {
            return res.status(404).json({message:'El trabajador no existe'});
        }

        const tId = tResult.rows[0].id_trabajador;
        
        //Verificar conflictos con asistencias en el rango de fechas

        const assist = await pool.query('SELECT * FROM asistencias WHERE id_trabajador = $1 AND fecha BETWEEN $2 AND $3', [tId, fecha_inicio, fecha_fin]);

        if (assist.rows.length > 0){
            console.log('superadas las asistencias')
            return res.status(400).json({message:'No se pudo registrar el permiso: hay asistencia(s) en el rango de las fechas'});
        }

        //Verificar conflictos con faltas en el rango de fechas

        const faults = await pool.query('SELECT * FROM faltas WHERE id_trabajador = $1 AND fecha BETWEEN $2 AND $3', [tId, fecha_inicio, fecha_fin]);

        if (faults.rows.length > 0){
            
            return res.status(400).json({message:'No se pudo registrar el permiso: hay falta(s) en el rango de las fechas'});
        }

        //Verficar conflictos con permisos existentes

        const permission = await pool.query('SELECT * FROM permisos WHERE id_trabajador = $1 AND (fecha_inicio <= $3 AND fecha_fin >= $2)', [tId, fecha_inicio, fecha_fin]);
   
        if (permission.rows.length > 0){
            
            return res.status(400).json({message:'No se pudo registrar el permiso: ya existe un permiso en el rango de fechas'});
        }
        
        //Registar el permiso en la base de datos

        await pool.query('INSERT INTO permisos (id_trabajador, fecha_inicio, fecha_fin, motivo) VALUES ($1, $2, $3, $4)', [tId, fecha_inicio, fecha_fin, motivo]);

        res.status(201).json({message:'Permiso registrado correctamente'});

    } catch (error) {

        console.error('Error al registrar permiso', error);
        res.status(500).json({message:'Error al registar permiso', error: error.message});
    }
    };

module.exports = {permissionRegister}
