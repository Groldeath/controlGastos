import { FastifyInstance } from 'fastify'
import { verifyJwt } from '../plugins/auth'
import * as crc from '../controllers/creditCardController'

export default async function (server: FastifyInstance) {
    server.addHook('onRequest', verifyJwt)

    server.post('/', crc.createCreditCard)
    server.get('/', crc.getCreditCards)
    server.put('/:id', crc.updateCreditCard)
    server.delete('/:id', crc.deleteCreditCard)
}
