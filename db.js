const { Pool } = require("pg");

// Dockhold injects DATABASE_URL when the managed database add-on is enabled.
// Never hardcode a connection string — read it from the environment.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Create the table on startup. The database is empty when first provisioned,
// so the app owns its schema. Safe to run on every boot.
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

module.exports = { pool, initDb };
