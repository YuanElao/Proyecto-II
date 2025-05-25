const Departamento = require("../../models/departamentos");


const department = {

  //Listar todos los departamentos

  async list(req, res) {

    try {

      const departamentos = await Departamento.listDep();
      console.log("Departamentos obtenidos:", departamentos)
      res.status(200).json(departamentos.map(dep => ({id_departamento: dep.id_departamento, d_name: dep.d_name}))); //Crea una lista de departamentos con objetos departamento

    } catch (error) {

      console.error("Error al obtener departamentos:", error);
      res.status(500).json({ message: "Error al obtener departamentos" });

    }
  },

  //Agregar un departamento

  async add(req, res) {

    const {d_name} = req.body;

    if (!d_name || d_name.trim() === "") {

      return res.status(400).json({ message: "El nombre del departamento es obligatorio" });
    }

    try {

      await Departamento.addDep(d_name);
      res.status(201).json({ message: "Departamento agregado correctamente" });

    } catch (error) {

      console.error("Error al agregar departamento:", error);
      res.status(500).json({ message: "Error al agregar departamento" });
    }
  },

  //Editar un departamento

  async edit(req, res) {

    const { id_departamento } = req.params;
    const { d_name } = req.body;

    try {

      await Departamento.editDep(id_departamento, d_name);
      res.status(200).json({ message: "Departamento actualizado correctamente" });

    } catch (error) {

      console.error("Error al actualizar departamento:", error);
      res.status(500).json({ message: "Error al actualizar departamento" });
    }
  },

  //Eliminar un departamento

  async delete(req, res) {

    const { id_departamento } = req.params;

    try {

      await Departamento.deleteDep(id_departamento);
      res.status(200).json({ message: "Departamento eliminado correctamente" });

    } catch (error) {

      console.error("Error al eliminar departamento:", error);
      res.status(500).json({ message: "Error al eliminar departamento" });
    }
  },
}



module.exports = department;