"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.verifyJwt = void 0;
// Middleware para verificar que JWT es válido y está presente
const verifyJwt = async (request, reply) => {
    try {
        await request.jwtVerify();
    }
    catch (err) {
        return reply.status(401).send({ error: 'No autorizado o token expirado' });
    }
};
exports.verifyJwt = verifyJwt;
// Middleware simplificado para requerir rol admin (debe correr después de verifyJwt)
const requireAdmin = async (request, reply) => {
    const user = request.user;
    if (!user || user.rol !== 'admin') {
        return reply.status(403).send({ error: 'Prohibido: Se require rol de Administrador' });
    }
};
exports.requireAdmin = requireAdmin;
