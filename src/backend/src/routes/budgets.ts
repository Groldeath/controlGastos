import { FastifyInstance } from 'fastify'
import { verifyJwt } from '../plugins/auth'
import * as bc from '../controllers/budgetController'

export default async function (server: FastifyInstance) {
    server.addHook('onRequest', verifyJwt)

    server.post('/', bc.createBudget)
    server.get('/', bc.getBudgets)
    server.put('/:id', bc.updateBudget)
    server.delete('/:id', bc.deleteBudget)
    server.get('/:id/movimientos', bc.getBudgetTransactions)
}
