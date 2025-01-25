//Comando para iniciar el Servidor npm run start

//Morgan sirve para visualizar por consola las peticiones que se vayan haciendo al servidor
//Cors permite que se acceda a nuesro servidor desde otros dominios
//path permite trabajar con rutas de archivos y directorios

const express = require ('express');
const morgan = require ('morgan');
const cors = require ('cors');
const path = require ('path');
const app = express();
const cron = require ('node-cron')

//Segundo Plano

const {faultsRegister} = require('./controllers/faults');

cron.schedule('00 12 * * 1-5', async () => {

    console.log('Ejecutado...');    
    
    try {
        await faultsRegister();
        console.log('Proceso de Faltas finalizado');

    } catch (error) {
        console.log('Error al registrar las faltas:', error.message);}
} , {

    timezone: "America/Caracas"
});


//Middlewares
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
console.log(__dirname)

//Rutas

app.use('/', require('./routes/auth.routes'));

//User

app.use('/user', require('./routes/register.routes'));
app.use('/user', require ('./routes/consult.routes'));


//app
app.use('/app', require('./routes/qrAssist.routes'));
app.use('/app', require ('./routes/faults.routes'));

//Admin

app.use('/admin', require('./routes/admin/permissions.routes'))



//Ajustes

app.set('port', 3000);

app.listen(app.get('port'), () =>{
    console.log('Server on Port ' + app.get('port'));
});

