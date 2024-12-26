const pool = require ('../database/keys')

async function testDB(){

    try{
        const result = await pool.query('SELECT NOW()');
        console.log('Conexion exitosa:', result.rows);
    }catch (error){
        console.error('error al conectar con la base de datos', error);
    }
}

testDB();



const authentication = {};

authentication.login = async (req, res) => {

    const {name, password, role} = req.body;

    if (role == 'admin'){

        try{

            const result = await pool.query('SELECT * FROM login WHERE c_name = $1 AND c_password = $2 AND c_rol = $3', [name, password, role]);
            
            if (result.rows.length > 0) {

                res.status(200).json({ message: 'Bienvenido Administrador', user: result.rows[0]});
            } else {

                res.status(404).json({ message: 'Usuario no Encontrado'});
            }

        }catch (error){
            console.error('error en la consulta:', error);
            res.status(500).json({
                message: 'Error del servidor', 
                error
            })
        }
    }else{

        try{

            const result = await pool.query('SELECT * FROM login WHERE c_name = $1 AND c_password = $2 AND c_rol = $3', [name, password, role]);
            
            if (result.rows.length > 0) {

                res.status(200).json({ message: 'Bienvenido Usuario', user: result.rows[0]});
            } else {

                res.status(404).json({ message: 'Usuario no Encontrado'});
            }

        }catch (error){
            console.error('error en la consulta:', error);
            res.status(500).json({
                message: 'Error del servidor', 
                error
            })
        }


    }
};

module.exports = authentication;

