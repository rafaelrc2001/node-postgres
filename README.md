# Aplicación CRUD con Node.js, Express y PostgreSQL

Esta es una aplicación de ejemplo que implementa operaciones CRUD (Crear, Leer, Actualizar, Eliminar) usando Node.js, Express y PostgreSQL.

## Requisitos Previos

- Node.js (v14 o superior)
- PostgreSQL (v10 o superior)
- npm o yarn

## Configuración Inicial

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd postgres-node2
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar la base de datos**
   - Asegúrate de que PostgreSQL esté en ejecución
   - Crea una base de datos llamada `nodepg` (o el nombre que prefieras)
   - Ejecuta el script SQL ubicado en `database/schema.sql` para crear la tabla necesaria

4. **Configurar variables de entorno**
   - Copia el archivo `.env.example` a `.env`
   - Edita el archivo `.env` con tus credenciales de PostgreSQL

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Configuración del servidor
PORT=3000
NODE_ENV=development

# Configuración de la base de datos
DB_USER=tu_usuario
DB_HOST=localhost
DB_NAME=nodepg
DB_PASSWORD=tu_contraseña
DB_PORT=5432
```

## Estructura del Proyecto

```
postgres-node2/
├── public/                 # Archivos estáticos (frontend)
│   ├── index.html          # Aplicación web
│   └── js/
│       └── app.js          # Lógica del frontend
├── src/
│   ├── config/             # Configuraciones
│   ├── controllers/        # Controladores
│   ├── routes/             # Rutas de la API
│   ├── db.js               # Conexión a la base de datos
│   └── index.js            # Punto de entrada de la aplicación
└── database/
    └── schema.sql          # Esquema de la base de datos
```

## Comandos Disponibles

- `npm start` - Inicia el servidor en modo producción
- `npm run dev` - Inicia el servidor en modo desarrollo con nodemon
- `npm test` - Ejecuta las pruebas (pendiente de implementar)

## Uso

1. Inicia el servidor:
   ```bash
   npm run dev
   ```

2. Abre tu navegador y ve a:
   ```
   http://localhost:3000
   ```

## API Endpoints

- `GET /api/users` - Obtener todos los usuarios
- `GET /api/users/:id` - Obtener un usuario por ID
- `POST /api/users` - Crear un nuevo usuario
- `PUT /api/users/:id` - Actualizar un usuario existente
- `DELETE /api/users/:id` - Eliminar un usuario

## Solución de Problemas

Si encuentras algún problema al ejecutar la aplicación:

1. Verifica que PostgreSQL esté en ejecución
2. Comprueba que las credenciales en `.env` sean correctas
3. Asegúrate de que la base de datos existe y el usuario tiene los permisos necesarios
4. Revisa los logs del servidor para ver mensajes de error detallados

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
