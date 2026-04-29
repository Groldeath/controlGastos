import { FastifyInstance } from 'fastify'
import { verifyJwt } from '../plugins/auth'
import * as cc from '../controllers/categoryController'

export default async function (server: FastifyInstance) {
    server.addHook('onRequest', verifyJwt)

    server.post('/', cc.createCategory)
    server.get('/', cc.getCategories)
    server.put('/:id', cc.updateCategory)
    server.delete('/:id', cc.deleteCategory)
}
