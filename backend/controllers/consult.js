const pool = require ('../database/keys')

const workerList = async (req, res) => {

    try {
        const result = await pool.query('SELECT t_cedula, t_name, t_apellido, CASE WHEN EXISTS (SELECT 1 FROM asistencias WHERE id_trabajador) FROM trabajadores ORDER BY t_name, t_apellido');
        res.status(200).json(result.rows); //Devuelve los trabajadores en orden alfabetico

    } catch (error) {
        console.error('Error al listar trabajadores:', error.message);
        res.status(500).json({message: 'Error al listar trabajadores', error: error.message})
    }
};

const getW = async (req, res) => {

    const {search} = req.query ;

    try {

        const sResult = await pool.query('SELECT t_cedula, t_name, t_apellido FROM trabajadores WHERE LOWER(t_cedula) LIKE LOWER($1) OR LOWER(t_name) LIKE LOWER($1) OR LOWER(t_apellido) LIKE LOWER($1) ORDER BY t_name, t_apellido', [`%${search}%`]);
        console.log(sResult.rows)
        
        res.status(200).json(sResult.rows);

    } catch (error) {

        console.error('Error al buscar trabajador:', error.message);
        res.status(500).json({error: 'Error al buscar trabajador'});
    }
};

module.exports = {getW, workerList}
