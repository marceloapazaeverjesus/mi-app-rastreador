const { db } = require('@vercel/postgres');
require('dotenv').config();

async function init() {
  const client = await db.connect();

  try {
    console.log("Iniciando creación de tablas...");

    // 1. Tabla de Usuarios
    await client.sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("✅ Tabla 'users' lista.");

    // 2. Tabla de Ubicaciones (Solo guarda la última posición de cada usuario)
    await client.sql`
      CREATE TABLE IF NOT EXISTS locations (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL,
        last_update TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("✅ Tabla 'locations' lista.");

    console.log("🚀 Base de datos preparada con éxito.");
  } catch (error) {
    console.error("❌ Error al crear las tablas:", error);
  } finally {
    process.exit();
  }
}

init();