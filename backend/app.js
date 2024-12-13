//Comando para iniciar el Servidor npm run start

//Morgan sirve para visualizar por consola las peticiones que se vayan haciendo al servidor
//Cors permite que se acceda a nuesro servidor desde otros dominios
//path permite trabajar con rutas de archivos y directorios

const express = require ('express');
const morgan = require ('morgan');
const cors = require ('cors');
const path = require ('path');


const app = express();

//Middlewares
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
console.log(__dirname)

//Rutas

app.get('/', (req, res) => { res.send('Hello'); })


//Ajustes

app.set('port', 3000);

app.listen(app.get('port'), () =>{
    console.log('Server on Port ' + app.get('port'));
});

