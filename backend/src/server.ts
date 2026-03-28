import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import dotenv from 'dotenv'
import path from 'path'

// Cargar .env de la raíz en desarrollo local
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const server = Fastify({
    logger: true
})

server.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
})

server.register(jwt, {
    secret: process.env.JWT_SECRET || 'supersecret'
})

// Registrar rutas
import userRoutes from './routes/users'
import categoryRoutes from './routes/categories'
import creditCardRoutes from './routes/creditCards'
import transactionRoutes from './routes/transactions'
import authRoutes from './routes/auth'

server.register(userRoutes, { prefix: '/api/users' })
server.register(categoryRoutes, { prefix: '/api/categories' })
server.register(creditCardRoutes, { prefix: '/api/credit-cards' })
server.register(transactionRoutes, { prefix: '/api/transactions' })
server.register(authRoutes, { prefix: '/api/auth' })

server.get('/ping', async (request, reply) => {
    return { status: 'ok', time: new Date() }
})

const start = async () => {
    try {
        await server.listen({ port: 3000, host: '0.0.0.0' })
        server.log.info(`Server listening on ${server.server.address()}`)
    } catch (err) {
        server.log.error(err)
        process.exit(1)
    }
}
start()
