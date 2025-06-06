//Comando para iniciar el Servidor npm run start

//Morgan sirve para visualizar por consola las peticiones que se vayan haciendo al servidor
//Cors permite que se acceda a nuesro servidor desde otros dominios
//path permite trabajar con rutas de archivos y directorios
//express es un framework usado para montar el servidor y getionar las rutas
//node-cron


const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const app = express(); // Crear Instancia de express
const cron = require("node-cron");


//Segundo Plano

const faultsRegister = require("./controllers/faults.js");

cron.schedule( //Creamos un cronograma el cual se va a ejecutar a las 12:00 pm de lunes a viernes
  "00 12 * * 1-5",  // * * * * * (minuto, hora, dia(mes), mes, dia(semana))
  async () => { //Funcion anonima asincrona
    console.log("Ejecutado...");

    try {
      await faultsRegister.register(); //se llama al metodo register de faltas
      console.log("Proceso de Faltas finalizado");
    } catch (error) {
      console.log("Error al registrar las faltas:", error.message);
    }

  },
  {
    timezone: "America/Caracas", //zona horaria en la que se basara cron
  }
);

cron.schedule(
  "00 11 8 1 *",  // 1ero de enero, 2:00 AM
  async () => {
    console.log("Ejecutando backup automático anual...");
    await backupController.runAutoBackup();
  },
  {
    timezone: "America/Caracas",
  }
);

//Middlewares, son aquellas capaz que agregan funcionalidades a las peticiones cuando estas son recibidas

app.use(morgan("tiny")); //Informacion resumida de las peticiones
app.use(cors()); //Pemitimos que se acceda al servidor desde otros dominios (frontend)
app.use(express.json()); //Con este middle recibimos y convertimos JSON en objetos JavaScript
app.use(express.urlencoded({ extended: true })); //Con este podemos recibir y procesar datos enviados desde un formulario HTML

console.log(__dirname);


//Con app.use aparte de usar middlewares tambien se usa para establecer las rutas



//Rutas
app.use("/", require("./routes/auth.routes")); //ruta login

//User
app.use("/user", require("./routes/register.routes")); //ruta registro de trabajador
app.use("/user", require("./routes/consult.routes")); //ruta consulta de trabajador
app.use("/user", require("./routes/profile.routes")); //ruta perfil de trabajador

//app
app.use("/app", require("./routes/qrAssist.routes")); //ruta de la aplicacion

//Backup
app.use("/admin", require("./routes/admin/backup.routes.js"));

//Admin
app.use("/admin", require("./routes/admin/permissions.routes")); //ruta de permisos
app.use("/admin", require("./routes/admin/profileAdmin.routes")); //ruta de perfil del lado del administrador
app.use("/admin", require("./routes/admin/job.routes.js")); //ruta de cargos
app.use("/admin", require("./routes/admin/department.routes.js")); //ruta de departamentos
app.use("/admin", require("./routes/faults.routes")); //ruta de faltas
app.use("/admin", require("./routes/admin/accounts.routes.js")); //ruta de cuentas
app.use("/admin", require("./routes/admin/report.routes.js")); //ruta de reportes

//Ajustes

app.set("port", 3000); //establecemos el puerto que usara express

app.listen(app.get("port"), () => { //se inicia un servidor web el cual escuchara peticiones en este caso localhost y el puerto establecido
  console.log("Server on Port " + app.get("port")); //mensaje en la consola quue muestra el puerto donde esta alojado el servidor
});
