const pool = require ('../database/keys')

const getT = async (req, res) => {

    const {search} = req.query ;

    try {

        let query = 'SELECT t_cedula, t_name, t_apellido FROM trabajadores ORDER BY t_apellido ASC, t_name ASC';

        const params = [];
        if (search) {

            query = 'SELECT t_cedula, t_name, t_apellido FROM trabajadores WHERE t_cedula ILIKE $1 OR t_name ILIKE $1 OR t_apellido ILIKE $1 ORDER BY t_apellido ASC, t_name ASC';
            params.push(`%${search}%`);
        }

        const result = await pool.query(query, params);
        res.status(200).json(result.rows);

    } catch (error) {

        console.error('Error al obtener trabajadores:', error.message);
        res.status(500).json({error: 'Error interno del servidor'});
    }
};

module.exports = {getT}
