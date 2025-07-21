import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PORT } from './config.js';
import { pool, testConnection } from './db.js';
import usersRouter from './routes/users.routers.js';
import signaturesRouter from './routes/signatures.routers.js';

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Crear la aplicación Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Log de las solicitudes para depuración
app.use((req, res, next) => {
  console.log('Solicitud recibida:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body
  });
  next();
});

// Configurar la ruta estática para archivos públicos
const publicPath = join(process.cwd(), 'public');
console.log('Ruta de archivos estáticos:', publicPath);
app.use(express.static(publicPath));

// Rutas de la API
app.use('/api/users', usersRouter);
app.use('/api/signatures', signaturesRouter);

// Ruta para el frontend (manejar rutas del cliente con SPA)
app.get('*', (req, res) => {
  res.sendFile(join(publicPath, 'index.html'));
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error('Error en la aplicación:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message
  });
});

// Función para iniciar el servidor
const startServer = async () => {
  // Probar la conexión a la base de datos
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('No se pudo conectar a la base de datos. Saliendo...');
    process.exit(1);
  }

  // Iniciar el servidor
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n=== SERVIDOR INICIADO ===`);
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`\n=== RUTAS DE API DISPONIBLES ===`);
    console.log(`- GET    http://localhost:${PORT}/api/users`);
    console.log(`- POST   http://localhost:${PORT}/api/users`);
    console.log(`- GET    http://localhost:${PORT}/api/users/:id`);
    console.log(`- PUT    http://localhost:${PORT}/api/users/:id`);
    console.log(`- DELETE http://localhost:${PORT}/api/users/:id`);
    console.log('\nPresiona Ctrl+C para detener el servidor\n');
  });

  return server;
};

// Iniciar la aplicación
let server;
try {
  server = await startServer();
} catch (error) {
  console.error('Error al iniciar el servidor:', error);
  process.exit(1);
}

// Manejo de errores del servidor
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\x1b[31mError: El puerto ${PORT} ya está en uso.\x1b[0m`);
  } else {
    console.error('\x1b[31mError al iniciar el servidor:\x1b[0m', error);
  }
  process.exit(1);
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('\nRecibida señal SIGTERM. Cerrando el servidor...');
  server.close(() => {
    console.log('Servidor cerrado.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nRecibida interrupción (Ctrl+C). Cerrando el servidor...');
  server.close(() => {
    console.log('Servidor cerrado.');
    process.exit(0);
  });
});
