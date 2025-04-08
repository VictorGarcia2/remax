// index.js (como ES Module)
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import https from 'https';
import fs from 'fs';

const app = express();
const PORT = 3000;


app.use(cors());
app.use(express.json());

app.get('/character', async (req, res) => {
  try {
    const response = await axios.get('https://rickandmortyapi.com/api/character', {
      headers: {
        Authorization: 'Bearer Hvh8n23m53.n7hiu32S09gh6tUj.JJpyfq.HioJ19J3RGgHJSIOop4t4t',
        Accept: 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error al obtener propiedades:', error.message);
    res.status(500).json({ error: 'Error al obtener propiedades', message: error.message });
  }
});

// Configuración HTTPS
const httpsOptions = {
  key: fs.readFileSync('./ssl/key.pem'),
  cert: fs.readFileSync('./ssl/cert.pem')
};

https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`✅ Servidor HTTPS en https://localhost:${PORT}`);
});
