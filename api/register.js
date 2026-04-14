// api/register.js
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { username, password, email } = req.body;

  try {
    // 1. Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 2. Guardar en la base de datos de Vercel
    await sql`
      INSERT INTO users (username, password, email)
      VALUES (${username}, ${hashedPassword}, ${email})
    `;

    return res.status(200).json({ message: 'Usuario creado exitosamente' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al registrar usuario', details: error.message });
  }
}