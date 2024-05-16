const express = require('express');
const {SerialPort} = require('serialport');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const port = 3000;

const serialPort = new SerialPort({path: 'COM4', baudRate: 9600 }); // Cambia 'COM3' por el nombre de tu puerto serial

// Crear servidor HTTP
const server = http.createServer(app);
const io = socketIo(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

serialPort.on('open', () => {
  console.log('Conexión establecida con el puerto serial.');
});

serialPort.on('data', data => {
  console.log('Datos recibidos:', data.toString());
  io.emit('serialData', data.toString()); // Enviar datos a todos los clientes conectados
});

// Configurar WebSocket
io.on('connection', socket => {
  console.log('Cliente conectado');
});

server.listen(port, () => {
  console.log(`Aplicación web corriendo en http://localhost:${port}`);
});
