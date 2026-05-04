import { FastifyInstance } from 'fastify'
import { verifyJwt } from '../plugins/auth'
import * as ac from '../controllers/alcanciaController'

export default async function (server: FastifyInstance) {
    server.addHook('onRequest', verifyJwt)

    server.post('/', ac.createAlcancia)
    server.get('/', ac.getAlcancias)
    server.put('/:id', ac.updateAlcancia)
    server.delete('/:id', ac.deleteAlcancia)
    server.patch('/:id/depositar', ac.depositar)
    server.patch('/:id/retirar', ac.retirar)
}
