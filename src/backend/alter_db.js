const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
});

async function run() {
    try {
        await pool.query(`ALTER TABLE tarjetas_credito DROP COLUMN IF EXISTS limite_credito CASCADE;`);
        console.log("Success dropping limite_credito");
    } catch (e) {
        console.error("Error connecting or updating DB:", e.message);
    } finally {
        pool.end();
    }
}
run();
