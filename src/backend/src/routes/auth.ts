import { FastifyInstance } from 'fastify'
import * as authController from '../controllers/authController'

export default async function (server: FastifyInstance) {
    // Redirige al proveedor de identidad (Pocket ID)
    server.get('/oidc/login', authController.oidcLogin)
    
    // Callback que recibe la respuesta del proveedor y genera el JWT
    server.get('/oidc/callback', authController.oidcCallback)
}
