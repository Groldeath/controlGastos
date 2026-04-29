import { FastifyInstance } from 'fastify'
import { verifyJwt, requireAdmin } from '../plugins/auth'
import * as uc from '../controllers/userController'

export default async function (server: FastifyInstance) {

    // Rutas Públicas
    server.post('/setup', uc.setupInitialAdmin)
    server.post('/login', uc.login)
    server.get('/setup-status', uc.checkSetupStatus)

    // Rutas Protegidas (Requieren Login)
    server.register(async (protectedRoutes) => {
        // Aplicar hook que lanza 401 si no hay un JWT válido
        protectedRoutes.addHook('onRequest', verifyJwt)

        protectedRoutes.get('/profile', uc.getProfile)

        // Rutas Exclusivas de Administrador
        protectedRoutes.get('/', { preValidation: [requireAdmin] }, uc.getUsers)
        protectedRoutes.post('/', { preValidation: [requireAdmin] }, uc.createUser)
        protectedRoutes.put('/:id', { preValidation: [requireAdmin] }, uc.updateUser)
        protectedRoutes.delete('/:id', { preValidation: [requireAdmin] }, uc.deleteUser)
    })
}
