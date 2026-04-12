const { db } = require('@vercel/postgres');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || 'famaz_key_2026';

// 1. Endpoint de Registro
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    const client = await db.connect();
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await client.sql`
            INSERT INTO users (username, password) 
            VALUES (${username}, ${hashedPassword}) 
            RETURNING id, username;
        `;
        res.status(201).json(result.rows[0]);
    } catch (e) {
        res.status(400).json({ error: "El usuario ya existe o hay un error de datos" });
    }
});

// 2. Endpoint de Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const client = await db.connect();
    try {
        const user = await client.sql`SELECT * FROM users WHERE username = ${username}`;
        if (user.rows.length === 0) return res.status(401).json({ error: "Usuario no encontrado" });

        const valid = await bcrypt.compare(password, user.rows[0].password);
        if (!valid) return res.status(401).json({ error: "Contraseña incorrecta" });

        const token = jwt.sign({ id: user.rows[0].id, username: user.rows[0].username }, JWT_SECRET);
        res.json({ token, user: { id: user.rows[0].id, username: user.rows[0].username } });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 3. Endpoint para Actualizar Ubicación (Cada 1 metro)
app.post('/api/location', async (req, res) => {
    const { user_id, latitude, longitude } = req.body;
    const client = await db.connect();
    try {
        await client.sql`
            INSERT INTO locations (user_id, latitude, longitude, last_update)
            VALUES (${user_id}, ${latitude}, ${longitude}, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id) 
            DO UPDATE SET 
                latitude = EXCLUDED.latitude, 
                longitude = EXCLUDED.longitude, 
                last_update = CURRENT_TIMESTAMP;
        `;
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 4. Endpoint para Ver Todos los Usuarios (Panel Admin / Web)
app.get('/api/users-status', async (req, res) => {
    const client = await db.connect();
    try {
        const result = await client.sql`
            SELECT u.id, u.username, l.latitude, l.longitude, l.last_update 
            FROM users u
            LEFT JOIN locations l ON u.id = l.user_id;
        `;
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = app;