const { db } = require('@vercel/postgres');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Configuración de CORS para permitir que tu App móvil y la Web accedan
app.use(cors({
    origin: '*', // En producción puedes cambiarlo por tu dominio específico
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'famaz_key_2026';

// 1. Endpoint de Registro
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Faltan datos" });

    try {
        const client = await db.connect();
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await client.sql`
            INSERT INTO users (username, password) 
            VALUES (${username.toLowerCase()}, ${hashedPassword}) 
            RETURNING id, username;
        `;
        res.status(201).json(result.rows[0]);
    } catch (e) {
        console.error(e);
        res.status(400).json({ error: "El usuario ya existe o hay un error de conexión" });
    }
});

// 2. Endpoint de Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const client = await db.connect();
        const user = await client.sql`SELECT * FROM users WHERE username = ${username.toLowerCase()}`;
        
        if (user.rows.length === 0) return res.status(401).json({ error: "Usuario no encontrado" });

        const valid = await bcrypt.compare(password, user.rows[0].password);
        if (!valid) return res.status(401).json({ error: "Contraseña incorrecta" });

        const token = jwt.sign({ id: user.rows[0].id, username: user.rows[0].username }, JWT_SECRET);
        res.json({ token, user: { id: user.rows[0].id, username: user.rows[0].username } });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 3. Endpoint para Actualizar Ubicación
app.post('/api/location', async (req, res) => {
    const { user_id, latitude, longitude } = req.body;
    if (!user_id) return res.status(400).json({ error: "ID de usuario requerido" });

    try {
        const client = await db.connect();
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

// 4. Endpoint para Ver Todos los Usuarios
app.get('/api/users-status', async (req, res) => {
    try {
        const client = await db.connect();
        const result = await client.sql`
            SELECT u.id, u.username, l.latitude, l.longitude, l.last_update 
            FROM users u
            LEFT JOIN locations l ON u.id = l.user_id
            ORDER BY l.last_update DESC;
        `;
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = app;