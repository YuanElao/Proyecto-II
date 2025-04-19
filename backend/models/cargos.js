const pool = require("../database/keys");

class Cargo {
  constructor(id_cargo, c_name, id_departamento) {

    this.id_cargo = id_cargo;
    this.c_name = c_name;
    this.id_departamento = id_departamento;

    
  }

  //Obtener todos los cargos
  static async listJob() {
    const result = await pool.query(`SELECT c.id_cargo, c.c_name AS cargo, d.d_name AS departamento FROM cargo c JOIN departamento d ON c.id_departamento = d.id_departamento ORDER BY d_name, c_name`);
    return result.rows/*.map(row => new Cargo(row.id_cargo, row.cargo, row.id_departamento))*/;
  }

  //Obtener cargos por departamento

  static async listJobByDepartment(id_departamento) {
    const result = await pool.query("SELECT * FROM cargo WHERE id_departamento = $1 ORDER BY c_name", [id_departamento]);
    return result.rows;
  }
  
  //Agregar un nuevo cargo
  
  static async addJob(c_name, id_departamento) {
    await pool.query("INSERT INTO cargo (c_name, id_departamento) VALUES ($1, $2)", [c_name, id_departamento]);
  }

  //Editar un cargo
  
  static async editJob(id_cargo, {c_name, id_departamento}) {
    if (!c_name) throw new Error("El nombre no puede estar vacio.");
    await pool.query("UPDATE cargo SET c_name = $1, id_departamento = $2 WHERE id_cargo = $3", [ c_name, id_departamento, id_cargo]);
  }

  //Eliminar un cargo
  
  static async deleteJob(id_cargo) {
    await pool.query("UPDATE trabajadores SET id_cargo = NULL WHERE id_cargo = $1", [id_cargo])
    await pool.query("DELETE FROM cargo WHERE id_cargo = $1", [id_cargo]);
  }
}

module.exports = Cargo;