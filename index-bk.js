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

/// Ruta para leer desde un puerto COM específico
app.get('/leer/:puerto', (req, res) => {
    const puerto = req.params.puerto;
    const puertoSerie = new SerialPort({ path: puerto, baudRate: 9600 });

    puertoSerie.on('open', () => {
        console.log(`Conexión establecida en ${puerto}`);
    });

    puertoSerie.on('data', data => {
            
        if(data){

            console.log(`Datos recibidos desde ${puerto}: ${data}`);
            res.send(data.toString());
            // Cerrar el puerto después de enviar la respuesta
            puertoSerie.close(err => {
                if (err) {
                    // console.error(`Error al cerrar el puerto ${puerto}: ${err.message}`);
                }
            });

        }
        

    });


    // puertoSerie.on('open', () => {
    //     console.log(`Conexión establecida en ${puerto}`);
    // });

    puertoSerie.on('error', err => {
        // console.error(`Error en el puerto ${puerto}: ${err.message}`);
        const json = [
            {
              "peso": '00.00',
            }
            
        ]
        console.log(json[0].peso);
        res.status(500).json(json[0].peso);
    });
    

   
});





// Inicia el servidor
const portNumber = 3000; // Puerto en el que se ejecutará la API
app.listen(portNumber, () => {
  console.log(`Servidor escuchando en el puerto ${portNumber}`);
});