const pool = require ('../database/keys');

const qrAssistRe = async (req, res) => {
    
    try{

        const {tId} = req.body;
        console.log('Body Recibido:', req.body);
        //Verificar que se envio el tId

        if (!tId) {
            console.log('El tId es requerido');
            return res.status(400).json({ message: 'El tId es requerido'});
        }

        //Verificar que el trabajador existe

        const worker = await pool.query('SELECT * FROM trabajadores WHERE id_trabajador = $1', [tId]);
        if (worker.rows.length === 0) {
            console.log('El trabajador no existe');
            return res.status(404).json({message: 'El trabajador no existe'});
        }

        //Verificar si el trabajador ya registro su asistencia hoy

        const assist = await pool.query('SELECT * FROM asistencias WHERE id_trabajador = $1 AND fecha = CURRENT_DATE', [tId]);

        if (assist.rows.length > 0 ){
            console.log('El trabajador ya fue registrado');
            return res.status(400).json({ message: 'No se pudo registrar la asistencia: asistencia registrada previamente'});
                
        } 

        const permission = await pool.query('SELECT * FROM permisos WHERE id_trabajador = $1 AND CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin',[tId]);
 
        if (permission.rows.length > 0 ){
            console.log('El trabajador ya fue registrado');
            return res.status(400).json({ message: 'No se pudo registrar la asistencia: permiso registrado previamente'});
                
        }

        const fault = await pool.query('SELECT * FROM faltas WHERE id_trabajador = $1 AND fecha = CURRENT_DATE', [tId]);

        if (fault.rows.length > 0 ){
            console.log('El trabajador ya fue registrado');
            return res.status(400).json({ message: 'No se pudo registrar la asistencia: falta registrada previamente'});
                
        }  
        //Registar la asistencia en la base de datos

        await pool.query('INSERT INTO asistencias (id_trabajador, fecha, hora) VALUES ($1, CURRENT_DATE, CURRENT_TIME)',[tId]);
        console.log('Asistencia registrada exitosamente');
        res.status(201).json({message: 'Asistencia registrada exitosamente'});
        
    } catch (error){
        console.error('Error al registrar la asistencia', error);
        res.status(500).json({ message: 'Error al registar la asistencia', error});


        }
    };

    module.exports = {qrAssistRe};
