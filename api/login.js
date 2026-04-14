// api/login.js
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { email, password } = req.body;

  try {
    // 1. Buscar al usuario por email
    const { rows } = await sql`SELECT * FROM users WHERE email = ${email}`;
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // 2. Comparar la contraseña ingresada con la encriptada en la BD
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // 3. Generar un Token de sesión (opcional pero recomendado)
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'clave_secreta', { expiresIn: '7d' });

    return res.status(200).json({ 
      message: 'Login exitoso', 
      token, 
      user: { id: user.id, username: user.username } 
    });

  } catch (error) {
    return res.status(500).json({ error: 'Error en el servidor', details: error.message });
  }
}