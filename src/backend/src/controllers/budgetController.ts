import { FastifyRequest, FastifyReply } from 'fastify'
import { query } from '../db'

export const createBudget = async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as { id: number }
    const { nombre, monto_limite, mes, anio, color_hex } = req.body as {
        nombre: string
        monto_limite: number
        mes: number
        anio: number
        color_hex?: string
    }

    if (!nombre || monto_limite === undefined || !mes || !anio) {
        return reply.status(400).send({ error: 'Faltan campos obligatorios (nombre, monto_limite, mes, anio)' })
    }

    try {
        const res = await query(
            'INSERT INTO presupuestos (usuario_id, nombre, monto_limite, mes, anio, color_hex) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [user.id, nombre, monto_limite, mes, anio, color_hex || '#3b82f6']
        )
        return reply.status(201).send(res.rows[0])
    } catch (e: any) {
        return reply.status(500).send({ error: `Error creando presupuesto: ${e.message}` })
    }
}

export const getBudgets = async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as { id: number }
    const { mes, anio } = req.query as { mes?: string, anio?: string }

    try {
        let q = `
            SELECT p.*, COALESCE(SUM(t.monto), 0) as total_gastado
            FROM presupuestos p
            LEFT JOIN transacciones t ON p.id = t.presupuesto_id AND t.tipo = 'gasto'
            WHERE p.usuario_id = $1
        `
        const params: any[] = [user.id]

        if (mes && anio) {
            q += ' AND p.mes = $2 AND p.anio = $3'
            params.push(parseInt(mes), parseInt(anio))
        }

        q += ' GROUP BY p.id ORDER BY p.nombre ASC'

        const res = await query(q, params)
        return res.rows.map(row => ({
            ...row,
            total_gastado: parseFloat(row.total_gastado)
        }))
    } catch (e: any) {
        return reply.status(500).send({ error: `Error obteniendo presupuestos: ${e.message}` })
    }
}

export const updateBudget = async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as { id: number }
    const { id } = req.params as { id: string }
    const { nombre, monto_limite, color_hex } = req.body as {
        nombre?: string
        monto_limite?: number
        color_hex?: string
    }

    try {
        // Fetch current to merge
        const currentRes = await query('SELECT * FROM presupuestos WHERE id = $1 AND usuario_id = $2', [id, user.id])
        if (currentRes.rowCount === 0) return reply.status(404).send({ error: 'Presupuesto no encontrado' })

        const current = currentRes.rows[0]
        const finalNombre = nombre !== undefined ? nombre : current.nombre
        const finalMonto = monto_limite !== undefined ? monto_limite : current.monto_limite
        const finalColor = color_hex !== undefined ? color_hex : current.color_hex

        const res = await query(
            'UPDATE presupuestos SET nombre = $1, monto_limite = $2, color_hex = $3 WHERE id = $4 AND usuario_id = $5 RETURNING *',
            [finalNombre, finalMonto, finalColor, id, user.id]
        )
        return res.rows[0]
    } catch (e: any) {
        return reply.status(500).send({ error: `Error actualizando presupuesto: ${e.message}` })
    }
}

export const deleteBudget = async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as { id: number }
    const { id } = req.params as { id: string }

    try {
        const res = await query('DELETE FROM presupuestos WHERE id = $1 AND usuario_id = $2 RETURNING id', [id, user.id])
        if (res.rowCount === 0) return reply.status(404).send({ error: 'Presupuesto no encontrado' })
        return { message: 'Presupuesto eliminado', deletedId: res.rows[0].id }
    } catch (e: any) {
        return reply.status(500).send({ error: `Error eliminando presupuesto: ${e.message}` })
    }
}

export const getBudgetTransactions = async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as { id: number }
    const { id } = req.params as { id: string }

    try {
        // Check if budget exists and belongs to user
        const budgetRes = await query('SELECT id FROM presupuestos WHERE id = $1 AND usuario_id = $2', [id, user.id])
        if (budgetRes.rowCount === 0) return reply.status(404).send({ error: 'Presupuesto no encontrado' })

        // Get transactions
        const res = await query(`
            SELECT t.*, c.nombre as categoria_nombre 
            FROM transacciones t 
            LEFT JOIN categorias c ON t.categoria_id = c.id
            WHERE t.presupuesto_id = $1 AND t.usuario_id = $2
            ORDER BY t.fecha DESC
        `, [id, user.id])

        return res.rows
    } catch (e: any) {
        return reply.status(500).send({ error: `Error obteniendo transacciones del presupuesto: ${e.message}` })
    }
}
