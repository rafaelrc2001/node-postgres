import { Router } from "express";
import { pool } from '../db.js';

const router = Router();

// Obtener todos los usuarios
router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM users ORDER BY id');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Obtener un usuario por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Crear un nuevo usuario
router.post('/', async (req, res) => {
    const { username, email } = req.body;
    
    if (!username || !email) {
        return res.status(400).json({ message: 'Nombre de usuario y correo electrónico son requeridos' });
    }
    
    try {
        const result = await pool.query(
            'INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *', 
            [username, email]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear usuario:', error);
        
        if (error.code === '23505') { // Violación de restricción única
            return res.status(400).json({ message: 'El correo electrónico ya está en uso' });
        }
        
        res.status(500).json({ message: 'Error al crear el usuario' });
    }
});

// Actualizar un usuario existente
router.put('/:id', async (req, res) => {
    console.log('Solicitud PUT recibida:', {
        params: req.params,
        body: req.body,
        headers: req.headers
    });
    
    const { id } = req.params;
    const { username, email } = req.body;
    
    // Validación de datos
    if (!username || !email) {
        console.error('Datos faltantes:', { username, email });
        return res.status(400).json({ 
            success: false,
            message: 'Nombre de usuario y correo electrónico son requeridos',
            received: { username, email }
        });
    }
    
    try {
        console.log('Ejecutando consulta SQL:', {
            query: 'UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING *',
            values: [username, email, id]
        });
        
        const result = await pool.query(
            'UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING *',
            [username, email, id]
        );
        
        console.log('Resultado de la consulta:', { 
            rowCount: result.rowCount,
            rows: result.rows 
        });
        
        if (result.rowCount === 0) {
            console.warn('Usuario no encontrado con ID:', id);
            return res.status(404).json({ 
                success: false,
                message: 'Usuario no encontrado',
                userId: id
            });
        }
        
        console.log('Usuario actualizado exitosamente:', result.rows[0]);
        res.json({
            success: true,
            user: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error al actualizar usuario:', {
            error: {
                name: error.name,
                message: error.message,
                code: error.code,
                detail: error.detail,
                stack: error.stack
            },
            params: req.params,
            body: req.body
        });
        
        if (error.code === '23505') { // Violación de restricción única
            return res.status(400).json({ 
                success: false,
                message: 'El correo electrónico ya está en uso',
                code: 'DUPLICATE_EMAIL'
            });
        }
        
        res.status(500).json({ 
            success: false,
            message: 'Error interno del servidor al actualizar el usuario',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Eliminar un usuario
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id]);
        
        if (rowCount === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        res.sendStatus(204); // No Content
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ message: 'Error al eliminar el usuario' });
    }
});

export default router;