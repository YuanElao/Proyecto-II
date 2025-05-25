const Cargo = require("../../models/cargos");

const job = { 

//Listar Cargos

async list(req, res) {

    try {

      const cargos = await Cargo.listJob();
      res.status(200).json(cargos.map(cargo => ({id: cargo.id_cargo, nombre: cargo.cargo, id_Dep: cargo.id_departamento, departamento: cargo.departamento}))); //Devuelve una lista de cargos con objetos cargo

    } catch (error) {

      console.error("Error al obtener cargos:", error);
      res.status(500).json({ message: "Error al obtener cargos" });

    }
  },

  async listByDepartment(req, res) {

    try {

      const {id_departamento} = req.params;
      const cargos = await Cargo.listJobByDepartment(id_departamento);
      res.status(200).json(cargos);

    } catch (error) {

      console.error("Error al obtener cargos:", error);
      res.status(500).json({ message: "Error al obtener cargos"});
    }
  },
  //Agregar un cargo

  async add(req, res) {

    const { c_name, id_departamento } = req.body;

    if (!c_name || !id_departamento) {
      return res.status(400).json({ message: "Nombre del cargo y departamento son obligatorios" });
    }

    try {

      await Cargo.addJob(c_name, id_departamento);
      res.status(201).json({ message: "Cargo agregado correctamente" });

    } catch (error) {

      console.error("Error al agregar cargo:", error);
      res.status(500).json({ message: "Error al agregar cargo" });

    }
  },

  //Editar un cargo

  async edit(req, res) {

    const { id_cargo } = req.params;
    const { c_name, id_departamento } = req.body;
    
    try {
      
      await Cargo.editJob(id_cargo, {c_name, id_departamento});
      res.status(200).json({ message: "Cargo actualizado correctamente" });

    } catch (error) {

      console.error("Error al actualizar cargo:", error);
      res.status(500).json({ message: "Error al actualizar cargo" });
    }
  },

  //Eliminar un cargo

  async delete(req, res) {

    const { id_cargo } = req.params;

    try {

      await Cargo.deleteJob(id_cargo);
      res.status(200).json({ message: "Cargo eliminado correctamente" });

    } catch (error) {

      console.error("Error al eliminar cargo:", error);
      res.status(500).json({ message: "Error al eliminar cargo" });

    }
  }


};

module.exports = job;