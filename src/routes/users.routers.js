import { Router } from "express";
import { pool } from '../db.js';


const router = Router();
router.get('/users',async (req, res) => {
    const { rows }  = await pool.query('SELECT * FROM users');
    res.json(rows);
    })


router.get('/users/:id',async (req, res) => {
    const {id}=req.params;
    const { rows }  = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.send(rows[0]);

    })

router.post('/users',async (req, res) => {
    const data = req.body;
    const result = await pool.query('INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *', [data.username, data.email]);
    return res.json(result.rows[0]);
    })

router.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    const {  rowCount } = await pool.query('DELETE FROM users WHERE id = $1 returning *', [id]);
    console.log(rows);

    if (rowCount === 0) {
        return res.status(404).json({ message: 'User not found' });
    }
    return res.sendStatus(204); 
});


router.put('/users/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'ID must be a number' });
    }
    const data = req.body;
    const result = await pool.query('UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING *', [data.username, data.email, id]);
    HTMLFormControlsCollection.log(result);

    res.send("Actuzlizando usuarios" + id );
    }) 



export default router;