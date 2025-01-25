const pool = require ('../database/keys')



const faultsRegister = async () => {

    try {

        const today = new Date();

        //Obtener todos los trabajadores

        const workers = await pool.query('SELECT id_trabajador FROM trabajadores');

        for (const worker of workers.rows) {
            const {id_trabajador} = worker;


        //Verficar si ya existe una asistencia

        const assist = await pool.query('SELECT * FROM asistencias WHERE id_trabajador = $1 AND fecha = CURRENT_DATE', [id_trabajador]);


        if (assist.rows.length > 0 ){
           console.log(`No se pudo registrar la falta, el trabajador ${id_trabajador} ya cuenta con una asistencia `);  
           continue;
        } 

        //Verificar si ya existe una falta

        const fault = await pool.query('SELECT * FROM faltas WHERE id_trabajador = $1 AND fecha = CURRENT_DATE', [id_trabajador]);


        if (fault.rows.length > 0 ){
            console.log(`No se pudo registrar la falta, el trabajador ${id_trabajador} ya cuenta con una`);
            continue;  
        } 

        //Verificar si ya existe un permiso

        const permission = await pool.query('SELECT * FROM permisos WHERE id_trabajador = $1 AND CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin',[id_trabajador]);
        
        if (permission.rows.length > 0 ){
           console.log(`No se pudo registrar la falta, el trabajador ${id_trabajador} ya cuenta con un permiso`);
           continue;
        } 
        //Registrar falta

            await pool.query ('INSERT INTO faltas (id_trabajador, fecha) VALUES ($1, CURRENT_DATE)', [id_trabajador]);
            console.log(`Falta registrada para el trabajador con ID ${id_trabajador}`);}
        
        console.log('Registro de faltas comlpletado.');

    } catch (error) {
        console.error('Error al registrar faltas', error);
        throw error;
    }
};

module.exports = {faultsRegister};