const Falta = require("../models/faltas");
const Trabajador = require("../models/trabajador");

const faultsRegister = {

  async register(req, res) {

    try{

      const trabajadores = await Trabajador.listWorkers();

      for (const trabajador of trabajadores) {

        const falta = new Falta(trabajador.id_trabajador);
        const validacion = await falta.validationF();

        if(!validacion.valido){
          console.log(`No se registro falta para el trabajador ${falta.tId}: ${validacion.message}`);
          continue;
        }

        await falta.reFault();
        console.log(`Falta registrada para el trabajador ${falta.tId}`);
      }


    } catch (error){

      console.error("Error al registrar faltas", error);
      res.status(500).json({message: "Error al registrar faltas", error});
    }
  }
};

module.exports = faultsRegister ;
