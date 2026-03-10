import { FastifyRequest, FastifyReply } from 'fastify'

// Middleware para verificar que JWT es válido y está presente
export const verifyJwt = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        await request.jwtVerify()
    } catch (err) {
        return reply.status(401).send({ error: 'No autorizado o token expirado' })
    }
}

// Middleware simplificado para requerir rol admin (debe correr después de verifyJwt)
export const requireAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { rol: string }
    if (!user || user.rol !== 'admin') {
        return reply.status(403).send({ error: 'Prohibido: Se require rol de Administrador' })
    }
}
