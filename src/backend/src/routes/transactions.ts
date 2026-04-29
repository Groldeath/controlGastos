import { FastifyInstance } from 'fastify'
import { verifyJwt } from '../plugins/auth'
import * as tc from '../controllers/transactionController'

export default async function (server: FastifyInstance) {
    server.addHook('onRequest', verifyJwt)

    server.post('/', tc.createTransaction)
    server.get('/active-months', tc.getActiveMonths)
    server.get('/summary', tc.getSummary)
    server.get('/', tc.getTransactions)
    server.put('/:id', tc.updateTransaction)
    server.delete('/:id', tc.deleteTransaction)
}
