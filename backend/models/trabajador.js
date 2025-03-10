const pool = require ('../database/keys');
const crypto = require ('crypto')

class Trabajador {

    constructor(tname, tapellido, tcedula){

        this.tname = tname;
        this.tapellido = tapellido;
        this.tcedula = tcedula;

        this.registerWorker = this.registerWorker.bind(this)
        this.listWorkers = this.listWorkers.bind(this)
        this.searchWorker = this.searchWorker.bind(this)
    }



    async registerWorker() {

        //Formatear los datos
        const nombre = this.tname.charAt(0).toUpperCase() + this.tname.slice(1).toLowerCase();
        const apellido = this.tapellido.charAt(0).toUpperCase() + this.tapellido.slice(1).toLowerCase();
        const cedula = this.tcedula.replace(/\./g, "");

        //Generar un ID unico

        let tid;
        let isUnique = false;

        do {
            tid = crypto.randomBytes(3).toString("hex").slice(0, 5).toUpperCase();
            const existingTid = await pool.query("SELECT * FROM trabajadores WHERE id_trabajador = $1", [tid]);

            if(existingTid.rows.length === 0){

                isUnique = true;
            }
        } while (!isUnique);

        await pool.query ("INSERT INTO trabajadores (id_trabajador, t_name, t_apellido, t_cedula) VALUES ($1, $2, $3, $4)", [tid, nombre, apellido, cedula]);

        return {tid, nombre, apellido, cedula};
    }

    static async listWorkers() {
        const result = await pool.query("SELECT id_trabajador, t_name, t_apellido, t_cedula FROM trabajadores");
        return result.rows;
    }

    static async searchWorker(search) {
        const result = await pool.query(
          "SELECT id_trabajador, t_cedula, t_name, t_apellido FROM trabajadores WHERE LOWER(t_cedula) LIKE LOWER($1) OR LOWER(t_name) LIKE LOWER($1) OR LOWER(t_apellido) LIKE LOWER($1) ORDER BY t_name, t_apellido",
          [`%${search}%`]
        );
        return result.rows;
      }
}

    

module.exports = Trabajador