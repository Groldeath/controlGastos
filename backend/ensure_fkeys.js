const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
    user: process.env.DB_USER || 'root',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'control_gastos',
    password: process.env.DB_PASSWORD || 'root',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
});

async function run() {
    try {
        console.log("Asegurando ON DELETE SET NULL para categorias...");
        await pool.query(`
            ALTER TABLE transacciones 
            DROP CONSTRAINT IF EXISTS transacciones_categoria_id_fkey;
        `);
        await pool.query(`
            ALTER TABLE transacciones 
            ADD CONSTRAINT transacciones_categoria_id_fkey 
            FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL;
        `);
        console.log("Categoria constrain asegurado.");

        console.log("Asegurando ON DELETE SET NULL para tarjetas_credito...");
        await pool.query(`
            ALTER TABLE transacciones 
            DROP CONSTRAINT IF EXISTS transacciones_tarjeta_credito_id_fkey;
        `);
        await pool.query(`
            ALTER TABLE transacciones 
            ADD CONSTRAINT transacciones_tarjeta_credito_id_fkey 
            FOREIGN KEY (tarjeta_credito_id) REFERENCES tarjetas_credito(id) ON DELETE SET NULL;
        `);
        console.log("Tarjeta constraint asegurado.");
        console.log("DONE!");
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        pool.end();
    }
}
run();
