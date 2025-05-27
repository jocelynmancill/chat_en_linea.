const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const colors = [
  '#e6194b', '#3cb44b', '#ffe119', '#4363d8',
  '#f58231', '#911eb4', '#46f0f0', '#f032e6'
];

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

let clients = new Map();
let mensajes = [];  // almacenar últimos 50 mensajes

function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    let parsed;
    try {
      parsed = JSON.parse(data);
    } catch (e) {
      return;
    }

    if (parsed.type === 'username') {
      const userCount = clients.size;
      const color = colors[userCount % colors.length];
      clients.set(ws, { username: escapeHTML(parsed.username), color });

      console.log(`Nuevo usuario conectado: ${parsed.username}`);

      // Enviar historial de mensajes al nuevo usuario
      mensajes.forEach((msg) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(msg));
        }
      });

      return;
    }

    const user = clients.get(ws);
    if (user && parsed.message) {
      const cleanMessage = escapeHTML(parsed.message.trim());

      if (cleanMessage.length === 0 || cleanMessage.length > 500) return;

      const payload = {
        username: user.username,
        color: user.color,
        message: cleanMessage
      };

      // Guardar el mensaje en el historial
      mensajes.push(payload);
      if (mensajes.length > 50) mensajes.shift(); // mantener máximo 50 mensajes

      // Enviar el mensaje a todos los clientes conectados
      clients.forEach((info, client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(payload));
        }
      });
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

const PORT = process.env.PORT || 8080; 
server.listen(PORT, () => { 
  
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
