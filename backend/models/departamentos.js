const pool = require("../database/keys")

class Departamento {
  constructor (id_departamento, d_name) {

    this.id_departamento = id_departamento;
    this.d_name = d_name;

  }

  //Obtener todos los departamentos

  static async listDep() {
    const result = await pool.query("SELECT * FROM departamento ORDER BY d_name");
    return result.rows.map(row => ({id_departamento: row.id_departamento, d_name: row.d_name}));
  }

  //Agregar un nuevo departamento

  static async addDep(d_name) {
    const existe = await pool.query("SELECT * FROM departamento WHERE d_name = $1", [d_name]);
    if (existe.rows.length > 0) {
      throw new Error("El departamento ya existe")
    }
    await pool.query("INSERT INTO departamento (d_name) VALUES ($1)", [d_name]);
  }

  //Editar un departamento

  static async editDep(id_departamento, d_name) {
    if (!this.d_name) throw new Error("El nombre no puede estar vacio");
    await pool.query("UPDATE departamento SET d_name = $1 WHERE id_departamento = $2", [d_name, id_departamento]);
  }

  //Eliminar un departamento

  static async deleteDep(id_departamento) {
    await pool.query("UPDATE trabajadores SET id_departamento = NULL WHERE id_departamento = $1", [id_departamento])
    await pool.query("DELETE FROM departamento WHERE id_departamento = $1", [id_departamento]);
  }
}

module.exports = Departamento;