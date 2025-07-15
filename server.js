// server.js

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path, { dirname, join } from 'path';
import { generateMockData } from './generateMockData.js'; // Importa la función

const app = express();
const port = 3005;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors());
app.use(express.json());

// Sirve archivos estáticos desde la carpeta raíz del proyecto (donde están app.js, dashboard.js, etc.)
app.use(express.static(path.join(__dirname)));

// Sirve archivos desde la carpeta 'pages' (para tus HTML de contenido)
app.use('/pages', express.static(path.join(__dirname, 'pages')));

// Sirve archivos estáticos desde la carpeta 'img'
// Esto hace que lo que esté dentro de 'img' sea accesible bajo la URL /img/
app.use('/img', express.static(path.join(__dirname, 'img')));


// Define botData aquí
// Inicializaremos botData de forma asíncrona al iniciar el servidor
let botData = { mt5_accounts: [] };

// Función asíncrona para inicializar botData
async function initializeBotData() {
    try {
        const generatedData = await generateMockData(); // Llama a la función
        botData = generatedData; // Actualiza botData con los datos generados
        console.log('Datos mock iniciales cargados con éxito.');
    } catch (error) {
        console.error('Error al cargar los datos mock iniciales:', error);
    }
}

// Llama a la función de inicialización cuando el servidor esté listo
app.listen(port, async () => { // Hacemos la función del listen callback async
    console.log(`Servidor escuchando en http://localhost:${port}`);
    await initializeBotData(); // Llama a la inicialización aquí
});


app.post('/endpoint', (req, res) => {
    console.log('Cuerpo de la petición POST recibido:', req.body);
    // Esta ruta ahora puede seguir actualizando botData si envías datos desde el frontend
    // Si la intención es que los POSTs reemplacen los datos generados por el mock, esto es correcto.
    botData = { mt5_accounts: req.body };
    res.json({ message: 'Datos recibidos con éxito' });
});

app.get('/data', (req, res) => {
    // Esta ruta ahora servirá los datos que fueron cargados o generados en botData
    res.json(botData);
});

// Ruta API para regenerar los datos bajo demanda
app.get('/api/regenerate-data', async (req, res) => {
    console.log('Solicitud para regenerar datos mock...');
    try {
        const regeneratedData = await generateMockData();
        botData = regeneratedData;
        res.status(200).json({ message: 'Datos mock regenerados exitosamente.' });
    } catch (error) {
        console.error('Error al regenerar los datos mock:', error);
        res.status(500).json({ message: 'Error al regenerar los datos mock.', error: error.message });
    }
});


// Ruta para la página principal
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});

// Ruta para dashboard
app.get('/pages/dashboard.html', (req, res) => {
    res.sendFile(join(__dirname, 'pages', 'dashboard.html'));
});

// Ruta para calendario
app.get('/pages/calendar.html', (req, res) => {
    res.sendFile(join(__dirname, 'pages', 'calendar.html'));
});

// Ruta para risk
app.get('/pages/risk.html', (req, res) => {
    res.sendFile(join(__dirname, 'pages', 'risk.html'));
});

// Ruta para mindset
app.get('/pages/mindset.html', (req, res) => {
    res.sendFile(join(__dirname, 'pages', 'mindset.html'));
});

// <--- CAMBIO: Nueva ruta para forexfactory.html (ahora se sirve internamente)
app.get('/pages/forexfactory.html', (req, res) => {
    res.sendFile(join(__dirname, 'pages', 'forexfactory.html'));
});
