const express = require('express');
const { SerialPort } = require('serialport');

const app = express();
const port = 3000;

// Mantener un registro de los puertos abiertos
const puertosAbiertos = {};
let puertoSerie  ={}

// Ruta para obtener los puertos COM disponibles
app.get('/puertos', (req, res) => {
    SerialPort.list().then(ports => {
        res.json(ports);
    }).catch(err => {
        res.status(500).json({ error: err.message });
    });
});

// Ruta para leer desde un puerto COM específico
app.get('/leer/:puerto', (req, res) => {
    const puerto = req.params.puerto;

    // Verificar si el puerto ya está abierto
    if (puertosAbiertos[puerto]) {
        return res.status(400).json({ error: `El puerto ${puerto} ya está abierto` });
    }else{

        puertoSerie = new SerialPort({ path: puerto, baudRate: 9600 });
        puertoSerie.on('open', () => {
            console.log(`Conexión establecida en ${puerto}`);
        });
    }

    let dataBuffer = '';


    // Registrar el puerto como abierto
    puertosAbiertos[puerto] = true;


    puertoSerie.on('data', data => {
        console.log(`Datos recibidos desde ${puerto}: ${data}`);
        dataBuffer += data.toString();
        // res.send(data.toString());
    });

    puertoSerie.on('error', err => {
        console.error(`Error en el puerto ${puerto}: ${err.message}`);
        res.status(500).json({ error: err.message });
    });

    // Manejar el cierre del puerto
    puertoSerie.on('close', () => {
        console.log(`Puerto ${puerto} cerrado`);
        delete puertosAbiertos[puerto];
        res.send(dataBuffer); // Enviar los datos completos al cliente
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor API serial corriendo en http://localhost:${port}`);
});