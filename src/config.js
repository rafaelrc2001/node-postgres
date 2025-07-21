import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno desde el archivo .env
dotenv.config({ path: join(__dirname, '../../.env') });

// Configuración del servidor
export const PORT = process.env.PORT || 3000;
export const NODE_ENV = process.env.NODE_ENV || 'development';

// Configuración de la base de datos
export const DB_CONFIG = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'nodepg',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  max: parseInt(process.env.DB_MAX_CLIENTS || '20', 10),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS || '2000', 10)
};

// Validar configuración
if (!DB_CONFIG.user || !DB_CONFIG.database) {
  console.error('Error: Se requieren las variables de entorno DB_USER y DB_NAME');
  process.exit(1);
}
