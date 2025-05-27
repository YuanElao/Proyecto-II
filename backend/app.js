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

cron.schedule(
  "00 12 * * 1-5",
  async () => {
    console.log("Ejecutado...");

    try {
      await faultsRegister.register();
      console.log("Proceso de Faltas finalizado");
    } catch (error) {
      console.log("Error al registrar las faltas:", error.message);
    }

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
app.use(express.static(path.join(__dirname, "../frontend")));//Sirve archivos estaticos que no necesian ser generados dinamicamente por el servidor
console.log(__dirname);



//Rutas

app.use("/", require("./routes/auth.routes"));

//User

app.use("/user", require("./routes/register.routes"));
app.use("/user", require("./routes/consult.routes"));
app.use("/user", require("./routes/profile.routes"))

//app
app.use("/app", require("./routes/qrAssist.routes"));


//Admin


app.use("/admin", require("./routes/admin/permissions.routes"));
app.use("/admin", require("./routes/admin/profileAdmin.routes"));
app.use("/admin", require("./routes/admin/job.routes.js"));
app.use("/admin", require("./routes/admin/department.routes.js"));
app.use("/admin", require("./routes/faults.routes"));
app.use("/admin", require("./routes/admin/accounts.routes.js"));
app.use("/admin", require("./routes/admin/report.routes.js"))

//Ajustes

app.set("port", 3000);

app.listen(app.get("port"), () => {
  console.log("Server on Port " + app.get("port"));
});
