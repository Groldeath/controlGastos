import { FastifyRequest, FastifyReply } from 'fastify'
import { query } from '../db'

export const createCategory = async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as { id: number }
    const { nombre } = req.body as { nombre: string }

    if (!nombre) return reply.status(400).send({ error: 'El nombre de la categoría es obligatorio' })

    try {
        const res = await query(
            'INSERT INTO categorias (usuario_id, nombre) VALUES ($1, $2) RETURNING *',
            [user.id, nombre]
        )
        return reply.status(201).send(res.rows[0])
    } catch (e: any) {
        return reply.status(500).send({ error: `Error creando categoría: ${e.message}` })
    }
}

export const getCategories = async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as { id: number }
    try {
        const res = await query('SELECT * FROM categorias WHERE usuario_id = $1 ORDER BY nombre ASC', [user.id])
        return res.rows
    } catch (e: any) {
        return reply.status(500).send({ error: `Error obteniendo categorías: ${e.message}` })
    }
}

export const updateCategory = async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as { id: number }
    const { id } = req.params as { id: string }
    const { nombre } = req.body as { nombre: string }

    if (!nombre) return reply.status(400).send({ error: 'El nombre es obligatorio para actualizar' })

    try {
        const res = await query(
            'UPDATE categorias SET nombre = $1 WHERE id = $2 AND usuario_id = $3 RETURNING *',
            [nombre, id, user.id]
        )
        if (res.rowCount === 0) return reply.status(404).send({ error: 'Categoría no encontrada o no pertenece al usuario' })
        return res.rows[0]
    } catch (e: any) {
        return reply.status(500).send({ error: `Error actualizando categoría: ${e.message}` })
    }
}

export const deleteCategory = async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as { id: number }
    const { id } = req.params as { id: string }

    try {
        // PostgreSql maneja ON DELETE SET NULL para las transacciones asociadas gracias al DDL
        const res = await query('DELETE FROM categorias WHERE id = $1 AND usuario_id = $2 RETURNING id', [id, user.id])
        if (res.rowCount === 0) return reply.status(404).send({ error: 'Categoría no encontrada o no pertenece al usuario' })
        return { message: 'Categoría eliminada', deletedId: res.rows[0].id }
    } catch (e: any) {
        return reply.status(500).send({ error: `Error eliminando categoría: ${e.message}` })
    }
}
