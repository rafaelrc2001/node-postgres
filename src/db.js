import pg from 'pg';
import { DB_CONFIG } from './config.js';

// Crear el pool de conexiones con la configuración
const pool = new pg.Pool(DB_CONFIG);

// Manejo de eventos del pool
pool.on('connect', () => {
  console.log('Conexión exitosa a la base de datos PostgreSQL');
});

pool.on('error', (err) => {
  console.error('\x1b[31mError inesperado en el pool de conexiones:\x1b[0m', err);
  process.exit(-1);
});

/**
 * Prueba la conexión a la base de datos
 * @returns {Promise<boolean>} true si la conexión es exitosa, false en caso contrario
 */
const testConnection = async () => {
  let client;
  try {
    console.log('\n=== PROBANDO CONEXIÓN A POSTGRESQL ===');
    console.log('Host:', DB_CONFIG.host);
    console.log('Puerto:', DB_CONFIG.port);
    console.log('Base de datos:', DB_CONFIG.database);
    console.log('Usuario:', DB_CONFIG.user);
    
    client = await pool.connect();
    const result = await client.query('SELECT version()');
    console.log('\n\x1b[32m✓ Conexión a PostgreSQL establecida correctamente\x1b[0m');
    console.log('Versión de PostgreSQL:', result.rows[0].version);
    
    // Verificar si la tabla de usuarios existe
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.warn('\n\x1b[33mAdvertencia: La tabla "users" no existe en la base de datos.\x1b[0m');
      console.log('Puedes crearla ejecutando el script SQL en database/schema.sql');
    } else {
      console.log('Tabla "users" encontrada en la base de datos');
    }
    
    return true;
  } catch (error) {
    console.error('\n\x1b[31m✗ Error al conectar a PostgreSQL:\x1b[0m', error.message);
    console.error('\nAsegúrate de que:');
    console.error('1. PostgreSQL esté instalado y en ejecución');
    console.error(`2. La base de datos "${DB_CONFIG.database}" exista`);
    console.error(`3. El usuario "${DB_CONFIG.user}" tenga los permisos necesarios`);
    console.error(`4. La contraseña sea correcta`);
    console.error(`5. El puerto ${DB_CONFIG.port} sea el correcto`);
    console.error(`6. PostgreSQL esté configurado para aceptar conexiones desde ${DB_CONFIG.host}`);
    console.error('\nPuedes configurar estos valores en el archivo .env');
    return false;
  } finally {
    if (client) client.release();
  }
};

// Exportar el pool y la función de prueba
export { pool, testConnection };
