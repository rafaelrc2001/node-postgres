import { Router } from 'express';
import { pool } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Obtener todas las firmas
router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT id, name, signature_data as signature_image, created_at FROM signatures ORDER BY created_at DESC'
        );
        
        // No es necesario convertir a base64 ya que ya está en ese formato
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener firmas:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Obtener una firma por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query(
            'SELECT id, name, signature_data as signature_image, created_at FROM signatures WHERE id = $1',
            [id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Firma no encontrada' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener la firma:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Crear una nueva firma
router.post('/', async (req, res) => {
    const { name, signature_data } = req.body;

    if (!name || !signature_data) {
        return res.status(400).json({ 
            message: 'Nombre y datos de firma son requeridos' 
        });
    }

    // Validar que signature_data sea un string base64 válido
    if (!signature_data.startsWith('data:image/')) {
        return res.status(400).json({ 
            message: 'El formato de la firma no es válido. Debe ser una imagen en base64.' 
        });
    }

    try {
        const result = await pool.query(
            'INSERT INTO signatures (name, signature_data) VALUES ($1, $2) RETURNING id, name, signature_data as signature_image, created_at',
            [name, signature_data]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear la firma:', error);
        res.status(500).json({ message: 'Error al guardar la firma' });
    }
});

// Actualizar una firma
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, signature_data } = req.body;

    if (!name && !signature_data) {
        return res.status(400).json({ 
            message: 'Se requiere al menos un campo para actualizar (nombre o firma)' 
        });
    }

    // Validar que signature_data sea un string base64 válido si se proporciona
    if (signature_data && !signature_data.startsWith('data:image/')) {
        return res.status(400).json({ 
            message: 'El formato de la firma no es válido. Debe ser una imagen en base64.' 
        });
    }

    try {
        let query = '';
        let params = [];
        
        if (name && signature_data) {
            query = `
                UPDATE signatures 
                SET name = $1, signature_data = $2, updated_at = CURRENT_TIMESTAMP 
                WHERE id = $3 
                RETURNING id, name, signature_data as signature_image, created_at
            `;
            params = [name, signature_data, id];
        } else if (name) {
            query = `
                UPDATE signatures 
                SET name = $1, updated_at = CURRENT_TIMESTAMP 
                WHERE id = $2 
                RETURNING id, name, signature_data as signature_image, created_at
            `;
            params = [name, id];
        } else if (signature_data) {
            query = `
                UPDATE signatures 
                SET signature_data = $1, updated_at = CURRENT_TIMESTAMP 
                WHERE id = $2 
                RETURNING id, name, signature_data as signature_image, created_at
            `;
            params = [signature_data, id];
        }
        
        const result = await pool.query(query, params);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Firma no encontrada' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar la firma:', error);
        res.status(500).json({ message: 'Error al actualizar la firma' });
    }
});

// Eliminar una firma
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query('DELETE FROM signatures WHERE id = $1 RETURNING id', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Firma no encontrada' });
        }
        
        res.json({ message: 'Firma eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar la firma:', error);
        res.status(500).json({ message: 'Error al eliminar la firma' });
    }
});

export default router;
