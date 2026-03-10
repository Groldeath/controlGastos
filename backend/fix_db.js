const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function fixDb() {
    try {
        await pool.query("ALTER TABLE transacciones DROP CONSTRAINT IF EXISTS transacciones_tipo_check;");
        await pool.query("ALTER TABLE transacciones ADD CONSTRAINT transacciones_tipo_check CHECK (tipo IN ('ingreso', 'gasto', 'ahorro'));");
        console.log("Database constraints updated successfully.");
    } catch (err) {
        console.error("Error updating constraints:", err);
    } finally {
        await pool.end();
    }
}

fixDb();
