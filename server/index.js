// index.js (como ES Module)
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import https from 'https';
import fs from 'fs';

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta
app.get('/api/propiedades', async (req, res) => {
  try {
    const response = await axios.get('https://us-central1-remax-api.cloudfunctions.net/api/propiedades', {
      headers: {
        Authorization: 'Bearer Hvh8n23m53.n7hiu32S09gh6tUj.JJpyfq.HioJ19J3RGgHJSIOop4t4t',
        Accept: 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error(' Error al obtener propiedades:', error.message);
    res.status(500).json({ error: 'Error al obtener propiedades', message: error.message });
  }
});


/* app.get('/api/reviews', async (req, res) => {
  const PLACE_ID = "ChIJKXUPvsBBw4UR0E0egP5gxWY";
  const API_KEY = "AIzaSyDGzn6fDlMeBm_ybhHCEGa7PTfhOm8IOJg";

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json`, {
        params: {
          place_id: PLACE_ID,
          fields: 'reviews',
          key: API_KEY
        }
      }
    );

    const data = response.data;

    if (data.status !== "OK") {
      console.error("⚠️ Google Places API respondió con error:", data);
      return res.status(500).json({
        error: "Respuesta no exitosa de la API de Google",
        googleStatus: data.status,
        message: data.error_message || "No se proporcionó mensaje de error",
      });
    }

    res.json(data.result.reviews || []);
  } catch (error) {
    console.error("💥 Error al obtener reseñas:", error.message);
    if (error.response) {
      console.error("📦 Detalles del error de respuesta:", error.response.data);
    }
    res.status(500).json({
      error: 'Error al obtener reseñas',
      message: error.message,
      details: error.response?.data || 'Sin detalles adicionales'
    });
  }
});
 */


const httpsOptions = {
  key: fs.readFileSync('./ssl/key.pem'),
  cert: fs.readFileSync('./ssl/cert.pem')
};

https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`✅ Servidor HTTPS en https://localhost:${PORT}`);
  });