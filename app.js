require('dotenv').config();
console.clear();

// ---------------------------------- //
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan')
const cors = require('cors')

mongoose.set('useCreateIndex', true);

// Database Connection
mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: true })
    .then(() => {
        console.log('¡Connection Successfully!')
    });


// Initialize the application
const app = express();


// Middlewares
app.use('/static', express.static(__dirname + '/reportes'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'))
app.set('trust proxy', true);


// Cors
// app.use(function(req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//     next();
// });
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    // authorized headers for preflight requests
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();

    app.options('*', (req, res) => {
        // allowed XHR methods  
        res.header('Access-Control-Allow-Methods', 'GET, PATCH, PUT, POST, DELETE, OPTIONS');
        res.send();
    });
});

// Habilitar cors (DE MANERA LIMITADA)
const whitelist = ['IP'];
const corsOptions = {
    origin: (origin, callback) => {

        const existe = whitelist.some(dominio => dominio === origin);

        if (existe) {
            callback(null, true)
        } else {
            callback(new Error('No permitido por CORS'))
        }
    }
}

// Esta limita el acceso
// app.use(cors(corsOptions));

// Esta es abierta para todo el mundo.
app.use(cors());




//Routes
app.use(process.env.ROUTE, require(process.env.FILEROUTE));

// Run the server
app.listen(process.env.PORT, () => {
    console.log(`Servidor corriendo en el puerto ${process.env.PORT}`);
});