import { FastifyInstance } from 'fastify'
import { verifyJwt } from '../plugins/auth'
import * as sc from '../controllers/settingsController'

export default async function (server: FastifyInstance) {
    server.addHook('onRequest', verifyJwt)

    server.get('/', sc.getSettings)
    server.put('/', sc.updateSettings)
}
