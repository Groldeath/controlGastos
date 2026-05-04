import { Pool } from 'pg'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') })

const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
})

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
})

export const query = async (text: string, params?: any[]) => {
    const start = Date.now()
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    if (process.env.NODE_ENV === 'development') {
        console.log('executed query', { text, duration, rows: res.rowCount })
    }
    return res
}

export const getClient = () => {
    return pool.connect()
}
