/* import express from 'express';
import cors from 'cors';
import axios from 'axios';
import https from 'https';
import fs from 'fs';

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de API
app.get('/api/propiedades', async (req, res) => {
  try {
    const response = await axios.get('https://us-central1-remax-api.cloudfunctions.net/api/propiedades', {
      headers: {
        Authorization: 'Bearer TU_TOKEN_AQUI',
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
 */
import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de API
app.get('/api/propiedades', async (req, res) => {
  try {
    const response = await axios.get('https://us-central1-remax-api.cloudfunctions.net/api/propiedades', {
      headers: {
        Authorization: 'Bearer TU_TOKEN_AQUI',
        Accept: 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error al obtener propiedades:', error.message);
    res.status(500).json({ error: 'Error al obtener propiedades', message: error.message });
  }
});

// Escuchar en HTTP (Nginx se encargará del SSL)
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});
