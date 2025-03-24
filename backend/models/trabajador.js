const pool = require ('../database/keys');
const crypto = require ('crypto')

class Trabajador {

    constructor(tname, tapellido, tcedula, id_departamento = null, id_cargo = null){

        this.tname = tname;
        this.tapellido = tapellido;
        this.tcedula = tcedula;
        this.id_departamento = id_departamento;
        this.id_cargo = id_cargo;

        this.registerWorker= this.registerWorker.bind(this)
    }


    //Registrar trabajadores
    
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

        await pool.query ("INSERT INTO trabajadores (id_trabajador, t_name, t_apellido, t_cedula, id_departamento, id_cargo) VALUES ($1, $2, $3, $4, $5, $6)", [tid, nombre, apellido, cedula, this.id_departamento, this.id_cargo]);

        return {tid, nombre, apellido, cedula, departamento: this.id_departamento, cargo: this.id_cargo};
    }

    //Listar Trabajadores

    static async listWorkers() {
        const result = await pool.query(`SELECT 
            t.t_name AS nombre,
            t.t_apellido AS apellido,
            t.t_cedula,
            COALESCE(d.d_name, 'Sin asignar') AS departamento, 
            COALESCE(c.c_name, 'Sin asignar') AS cargo
        FROM trabajadores t
        LEFT JOIN departamento d ON t.id_departamento = d.id_departamento
        LEFT JOIN cargo c ON t.id_cargo = c.id_cargo
        ORDER BY t.t_name`);
        return result.rows;
    }

    //Consultar Trabajadores

    static async searchWorker(search, id_departamento = null, id_cargo = null) {
      let query = `
          SELECT 
              t.id_trabajador, 
              t.t_cedula, 
              t.t_name AS nombre,
              t.t_apellido AS apellido,
              COALESCE(d.d_name, 'Sin asignar') AS departamento,
              COALESCE(c.c_name, 'Sin asignar') AS cargo
          FROM trabajadores t
          LEFT JOIN departamento d ON t.id_departamento = d.id_departamento
          LEFT JOIN cargo c ON t.id_cargo = c.id_cargo
          WHERE 1=1
      `;
  
      const params = [];
  
      // Búsqueda por texto
      if (search) {
          query += `
              AND (
                  LOWER(t.t_cedula) LIKE LOWER($${params.length + 1}) 
                  OR LOWER(t.t_name) LIKE LOWER($${params.length + 1}) 
                  OR LOWER(t.t_apellido) LIKE LOWER($${params.length + 1})
              )
          `;
          params.push(`%${search}%`);
      }
  
      // Filtro por departamento
      if (id_departamento) {
          query += ` AND d.id_departamento = $${params.length + 1}`;
          params.push(id_departamento);
      }
  
      if (id_cargo) {
        query += ` AND c.id_cargo = $${params.length + 1}`;
        params.push(id_cargo)
      }

      query += " ORDER BY t.t_name, t.t_apellido";
  
      const result = await pool.query(query, params);
      return result.rows;
  }


    //Obtener Trabajador por Cedula

    static async obtainByCi(cedula) {
        const result = await pool.query(`SELECT t.id_trabajador, t.t_name, t.t_apellido, t.t_cedula, 
              COALESCE(d.d_name, 'Sin asignar') AS departamento, 
              COALESCE(c.c_name, 'Sin asignar') AS cargo
       FROM trabajadores t
       LEFT JOIN departamento d ON t.id_departamento = d.id_departamento
       LEFT JOIN cargo c ON t.id_cargo = c.id_cargo
       WHERE t.t_cedula = $1`,
      [cedula]);
        return result.rows[0] || null;
    }

    //Editar Datos de un Trabajador

    static async editWorker (cedula, nombre, apellido, nuevaCedula, id_departamento, id_cargo) {

      const worker = await pool.query("SELECT t_name, t_apellido, t_cedula, id_departamento, id_cargo FROM trabajadores WHERE t_cedula = $1",[cedula]);

  if (worker.rows.length === 0) {
    throw new Error("Trabajador no encontrado.");
  }

  const formatText = (texto) => texto ? texto.trim().charAt(0).toUpperCase() + texto.slice(1).toLowerCase() : null;
  const cleanCi = (cedula) => cedula ? cedula.replace(/\D/g, "") : null;

  const nombreFinal = formatText(nombre) || worker.rows[0].t_name;
  const apellidoFinal = formatText(apellido) || worker.rows[0].t_apellido;
  const cedulaFinal = cleanCi(nuevaCedula) || worker.rows[0].t_cedula;
  const idDepartamentoFinal = id_departamento || worker.rows[0].id_departamento;
  const idCargoFinal = id_cargo || worker.rows[0].id_cargo;

  // Verificar si la nueva cédula ya existe en otro trabajador
  if (cedulaFinal !== cedula) {
    const exist = await pool.query("SELECT id_trabajador FROM trabajadores WHERE t_cedula = $1 AND t_cedula <> $2", [cedulaFinal, cedula]);
    if (exist.rows.length > 0) {
      throw new Error("La nueva cédula ya está registrada en otro trabajador");
    }
  }

  // Verificar que el departamento y cargo existan si se están actualizando
  if (id_departamento) {
    const depExiste = await pool.query("SELECT * FROM departamento WHERE id_departamento = $1", [id_departamento]);
    if (depExiste.rows.length === 0) throw new Error("El departamento seleccionado no existe.");
  }
  if (id_cargo) {
    const cargoExiste = await pool.query("SELECT * FROM cargo WHERE id_cargo = $1", [id_cargo]);
    if (cargoExiste.rows.length === 0) throw new Error("El cargo seleccionado no existe.");
  }

  // Actualizar los datos del trabajador
  await pool.query(
    "UPDATE trabajadores SET t_name = $1, t_apellido = $2, t_cedula = $3, id_departamento = $4, id_cargo = $5 WHERE t_cedula = $6",
    [nombreFinal, apellidoFinal, cedulaFinal, idDepartamentoFinal, idCargoFinal, cedula]
  );
    }

    //Eliminar un Trabajador

    static async deleteWorker (cedula) {
        await pool.query("DELETE FROM trabajadores WHERE t_cedula = $1", [cedula]);
    }
}

    

module.exports = Trabajador