const pool = require ('../database/keys');
const crypto = require ('crypto')
const QRCode = require ('qrcode')


const register = {};

register.worker = async (req, res) =>{
    const {tname, tapellido, tcedula} = req.body;

    try {

        if (!tname || !tapellido || !tcedula) {
            return res.status(400).json({
                message: 'Todos los campos son obligatorios'
            });
        }

        const formattedTName = tname.charAt(0).toUpperCase() + tname.slice(1).toLowerCase();

        const formattedTApellido = tapellido.charAt(0).toUpperCase() + tapellido.slice(1).toLowerCase();

        const formattedTCedula = tcedula.replace(/\./g, '');

        let tid;
        let isUnique = false;

        do {
            tid = crypto.randomBytes(3).toString('hex').slice(0, 5).toUpperCase();


            const existingTid = await pool.query('SELECT * FROM trabajadores WHERE id_trabajador = $1', [tid]);
            if (existingTid.rows.length === 0) {
                isUnique = true;
            }

        } while (!isUnique);

        await pool.query('INSERT INTO trabajadores (id_trabajador, t_name, t_apellido, t_cedula) VALUES ($1, $2, $3, $4)', [tid, formattedTName, formattedTApellido, formattedTCedula]);


        const qrCode = await QRCode.toDataURL(tid);

        res.status(201).json({
            message: 'Trabajador registrado exitosamente',
            data: {tid, formattedTName, formattedTApellido, formattedTCedula, qrCode},
        });
    } catch (error){
        console.error('Error al registrar trabajador', error);
        res.status(500).json({
            message:'Error del servidor', error
        });
    }

};





module.exports = register