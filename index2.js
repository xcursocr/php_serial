const express = require('express');
const { SerialPort } = require('serialport');
const cors = require('cors');

const app = express();
// Habilitar CORS para todas las rutas
app.use(cors());

// Ruta para obtener los puertos COM disponibles
app.get('/puertos', (req, res) => {
    SerialPort.list().then(ports => {
        res.json(ports);
    }).catch(err => {
        res.status(500).json({ error: err.message });
    });
});

// Almacén temporal para los datos recibidos
const dataStore = {};

// Ruta para leer desde un puerto COM específico
app.get('/leer/:puerto', (req, res) => {
    const puerto = req.params.puerto;
    const puertoSerie = new SerialPort({ path: puerto, baudRate: 9600 });

    puertoSerie.on('open', () => {
        console.log(`Conexión establecida en ${puerto}`);
    });

    // Almacena temporalmente los datos recibidos
    dataStore[puerto] = '';
    puertoSerie.on('data', data => {
        if(data) {
            console.log(`Datos recibidos desde ${puerto}: ${data}`);
            dataStore[puerto] += data.toString();
        }
    });

    // Responde con los datos almacenados y limpia el almacenamiento
    setTimeout(() => {
        res.send(dataStore[puerto]);
        delete dataStore[puerto];
        puertoSerie.close(err => {
            if (err) {
                console.error(`Error al cerrar el puerto ${puerto}: ${err.message}`);
            }
        });
    }, 1000); // Espera 1000 milisegundos (1 segundo) antes de responder

    puertoSerie.on('error', err => {
        console.error(`Error en el puerto ${puerto}: ${err.message}`);
        res.status(500).json({ error: err.message });
    });
});

// Inicia el servidor
const portNumber = 3000; // Puerto en el que se ejecutará la API
app.listen(portNumber, () => {
  console.log(`Servidor escuchando en el puerto ${portNumber}`);
});
