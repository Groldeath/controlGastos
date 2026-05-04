import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import helmet from '@fastify/helmet'
import cookie from '@fastify/cookie'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

const server = Fastify({
    logger: true,
    bodyLimit: 1048576
})

// CORS restringido al origen del frontend
server.register(cors, {
    origin: process.env.APP_PUBLIC_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
})

// JWT: forzar variable de entorno — sin fallback hardcodeado
const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret) {
    throw new Error('JWT_SECRET no está definido en el entorno. La aplicación no puede iniciar sin un secreto JWT.')
}
server.register(jwt, { secret: jwtSecret })

// Rate limiting: global y estricto para login
server.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute'
})

// Headers de seguridad HTTP
server.register(helmet, {
    contentSecurityPolicy: false // SPA con inline styles de React
})

// Cookies para OIDC state
server.register(cookie)

// Headers adicionales manuales
server.addHook('onSend', async (request, reply, payload) => {
    reply.header('X-Content-Type-Options', 'nosniff')
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin')
    if (typeof payload === 'string') {
        reply.header('Content-Length', Buffer.byteLength(payload))
    }
})

// Registrar rutas
import userRoutes from './routes/users'
import categoryRoutes from './routes/categories'
import creditCardRoutes from './routes/creditCards'
import transactionRoutes from './routes/transactions'
import authRoutes from './routes/auth'
import budgetRoutes from './routes/budgets'
import alcanciaRoutes from './routes/alcancias'

server.register(userRoutes, { prefix: '/api/users' })
server.register(categoryRoutes, { prefix: '/api/categories' })
server.register(creditCardRoutes, { prefix: '/api/credit-cards' })
server.register(transactionRoutes, { prefix: '/api/transactions' })
server.register(budgetRoutes, { prefix: '/api/presupuestos' })
server.register(alcanciaRoutes, { prefix: '/api/alcancias' })
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
