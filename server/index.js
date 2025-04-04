import express from 'express';
import https from 'https';
import fs from 'fs';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = 3001;

app.use(cors({
    origin: 'https://localhost:5173',
    methods: ['GET', 'POST'],
}));

app.get('/api/propiedades', async (req, res) => {
    try {
        const response = await axios.get('https://us-central1-remax-api.cloudfunctions.net/api/propiedades', {
            headers: {
                'Authorization': `Bearer Hvh8n23m53.n7hiu32S09gh6tUj.JJpyfq.HioJ19J3RGgHJSIOop4t4t`, // 👈 Token Bearer
                'Content-Type': 'application/json'
            }
        }); // ✅ Ruta completa

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Error al obtener propiedades' });
    }
});

const httpsOptions = {
    key: fs.readFileSync('../ssl/key.pem'), // ✅ Ruta correcta
    cert: fs.readFileSync('../ssl/cert.pem') // ✅ Ruta correcta
};
https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`✅ Servidor HTTPS en https://localhost:${PORT}`);
});