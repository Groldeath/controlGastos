import { FastifyRequest, FastifyReply } from 'fastify'
import { query } from '../db'

export const createCreditCard = async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as { id: number }
    const { nombre, dia_corte, dia_pago } = req.body as any

    if (!nombre || !dia_corte) {
        return reply.status(400).send({ error: 'Faltan campos obligatorios (nombre, dia_corte)' })
    }

    try {
        const res = await query(
            'INSERT INTO tarjetas_credito (usuario_id, nombre, dia_corte, dia_pago) VALUES ($1, $2, $3, $4) RETURNING id, nombre, dia_corte, dia_pago',
            [user.id, nombre, dia_corte, dia_pago]
        )
        return reply.status(201).send(res.rows[0])
    } catch (e: any) {
        req.log.error(`Error creando tarjeta: ${e.message}`)
        return reply.status(500).send({ error: 'Error interno del servidor' })
    }
}

export const getCreditCards = async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as { id: number }
    try {
        const res = await query('SELECT id, nombre, dia_corte, dia_pago FROM tarjetas_credito WHERE usuario_id = $1 ORDER BY id ASC', [user.id])
        return res.rows
    } catch (e: any) {
        req.log.error(`Error obteniendo tarjetas: ${e.message}`)
        return reply.status(500).send({ error: 'Error interno del servidor' })
    }
}

export const updateCreditCard = async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as { id: number }
    const { id } = req.params as { id: string }
    const { nombre, dia_corte, dia_pago } = req.body as any

    if (!nombre || !dia_corte) {
        return reply.status(400).send({ error: 'Faltan campos obligatorios' })
    }

    try {
        const res = await query(
            'UPDATE tarjetas_credito SET nombre = $1, dia_corte = $2, dia_pago = $3 WHERE id = $4 AND usuario_id = $5 RETURNING id, nombre, dia_corte, dia_pago',
            [nombre, dia_corte, dia_pago, id, user.id]
        )
        if (res.rowCount === 0) return reply.status(404).send({ error: 'Tarjeta no encontrada' })
        return res.rows[0]
    } catch (e: any) {
        req.log.error(`Error actualizando tarjeta: ${e.message}`)
        return reply.status(500).send({ error: 'Error interno del servidor' })
    }
}

export const deleteCreditCard = async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as { id: number }
    const { id } = req.params as { id: string }

    try {
        const res = await query('DELETE FROM tarjetas_credito WHERE id = $1 AND usuario_id = $2 RETURNING id', [id, user.id])
        if (res.rowCount === 0) return reply.status(404).send({ error: 'Tarjeta no encontrada' })
        return { message: 'Tarjeta eliminada', deletedId: res.rows[0].id }
    } catch (e: any) {
        req.log.error(`Error eliminando tarjeta: ${e.message}`)
        return reply.status(500).send({ error: 'Error interno del servidor' })
    }
}
