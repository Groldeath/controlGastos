import { FastifyRequest, FastifyReply } from 'fastify'
import { query } from '../db'

export const createAlcancia = async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as { id: number }
    const { nombre, tipo, saldo_objetivo, monto_inicial, color_hex } = req.body as {
        nombre: string
        tipo: string
        saldo_objetivo?: number
        monto_inicial?: number
        color_hex?: string
    }

    if (!nombre) {
        return reply.status(400).send({ error: 'El nombre es obligatorio' })
    }

    if (!tipo || !['ahorro', 'fondo'].includes(tipo)) {
        return reply.status(400).send({ error: 'El tipo debe ser "ahorro" o "fondo"' })
    }

    if (tipo === 'fondo' && (!monto_inicial || monto_inicial <= 0)) {
        return reply.status(400).send({ error: 'El monto inicial es obligatorio para un fondo' })
    }

    try {
        const saldoInicial = tipo === 'fondo' ? monto_inicial : 0
        const res = await query(
            'INSERT INTO alcancias (usuario_id, nombre, tipo, saldo_actual, saldo_objetivo, monto_inicial, color_hex) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [user.id, nombre, tipo, saldoInicial, saldo_objetivo || null, monto_inicial || null, color_hex || '#3b82f6']
        )
        return reply.status(201).send(res.rows[0])
    } catch (e: any) {
        return reply.status(500).send({ error: `Error creando alcancía: ${e.message}` })
    }
}

export const getAlcancias = async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as { id: number }

    try {
        const res = await query(
            'SELECT * FROM alcancias WHERE usuario_id = $1 ORDER BY tipo, nombre ASC',
            [user.id]
        )
        return res.rows.map(row => ({
            ...row,
            saldo_actual: parseFloat(row.saldo_actual),
            saldo_objetivo: row.saldo_objetivo ? parseFloat(row.saldo_objetivo) : null,
            monto_inicial: row.monto_inicial ? parseFloat(row.monto_inicial) : null
        }))
    } catch (e: any) {
        return reply.status(500).send({ error: `Error obteniendo alcancías: ${e.message}` })
    }
}

export const updateAlcancia = async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as { id: number }
    const { id } = req.params as { id: string }
    const { nombre, saldo_objetivo, monto_inicial, color_hex } = req.body as {
        nombre?: string
        saldo_objetivo?: number | null
        monto_inicial?: number
        color_hex?: string
    }

    try {
        const currentRes = await query('SELECT * FROM alcancias WHERE id = $1 AND usuario_id = $2', [id, user.id])
        if (currentRes.rowCount === 0) return reply.status(404).send({ error: 'Alcancía no encontrada' })

        const current = currentRes.rows[0]
        const finalNombre = nombre !== undefined ? nombre : current.nombre
        const finalObjetivo = saldo_objetivo !== undefined ? saldo_objetivo : current.saldo_objetivo
        const finalMontoInicial = monto_inicial !== undefined ? monto_inicial : current.monto_inicial
        const finalColor = color_hex !== undefined ? color_hex : current.color_hex

        // Si se actualiza monto_inicial en un fondo, ajustar el saldo proporcionalmente
        let finalSaldo = parseFloat(current.saldo_actual)
        if (current.tipo === 'fondo' && monto_inicial && monto_inicial > 0) {
            const anteriorMonto = parseFloat(current.monto_inicial || current.saldo_actual)
            const gastado = anteriorMonto - finalSaldo
            finalSaldo = Math.max(0, monto_inicial - gastado)
        }

        const res = await query(
            'UPDATE alcancias SET nombre = $1, saldo_objetivo = $2, monto_inicial = $3, color_hex = $4, saldo_actual = $5 WHERE id = $6 AND usuario_id = $7 RETURNING *',
            [finalNombre, finalObjetivo, finalMontoInicial, finalColor, finalSaldo, id, user.id]
        )
        return res.rows[0]
    } catch (e: any) {
        return reply.status(500).send({ error: `Error actualizando alcancía: ${e.message}` })
    }
}

export const deleteAlcancia = async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as { id: number }
    const { id } = req.params as { id: string }

    try {
        const res = await query('DELETE FROM alcancias WHERE id = $1 AND usuario_id = $2 RETURNING id', [id, user.id])
        if (res.rowCount === 0) return reply.status(404).send({ error: 'Alcancía no encontrada' })
        return { message: 'Alcancía eliminada', deletedId: res.rows[0].id }
    } catch (e: any) {
        return reply.status(500).send({ error: `Error eliminando alcancía: ${e.message}` })
    }
}

export const depositar = async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as { id: number }
    const { id } = req.params as { id: string }
    const { monto } = req.body as { monto: number }

    if (!monto || monto <= 0) {
        return reply.status(400).send({ error: 'El monto debe ser mayor a 0' })
    }

    try {
        const currentRes = await query('SELECT tipo FROM alcancias WHERE id = $1 AND usuario_id = $2', [id, user.id])
        if (currentRes.rowCount === 0) return reply.status(404).send({ error: 'Alcancía no encontrada' })
        if (currentRes.rows[0].tipo !== 'ahorro') {
            return reply.status(400).send({ error: 'Solo se puede depositar en alcancías de ahorro' })
        }

        const res = await query(
            'UPDATE alcancias SET saldo_actual = saldo_actual + $1 WHERE id = $2 AND usuario_id = $3 RETURNING *',
            [monto, id, user.id]
        )
        if (res.rowCount === 0) return reply.status(404).send({ error: 'Alcancía no encontrada' })
        return {
            ...res.rows[0],
            saldo_actual: parseFloat(res.rows[0].saldo_actual)
        }
    } catch (e: any) {
        return reply.status(500).send({ error: `Error depositando en alcancía: ${e.message}` })
    }
}

export const retirar = async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as { id: number }
    const { id } = req.params as { id: string }
    const { monto } = req.body as { monto: number }

    if (!monto || monto <= 0) {
        return reply.status(400).send({ error: 'El monto debe ser mayor a 0' })
    }

    try {
        const currentRes = await query('SELECT saldo_actual, tipo FROM alcancias WHERE id = $1 AND usuario_id = $2', [id, user.id])
        if (currentRes.rowCount === 0) return reply.status(404).send({ error: 'Alcancía no encontrada' })

        const saldoActual = parseFloat(currentRes.rows[0].saldo_actual)
        if (monto > saldoActual) {
            return reply.status(400).send({ error: 'No hay suficiente saldo en la alcancía' })
        }

        const res = await query(
            'UPDATE alcancias SET saldo_actual = saldo_actual - $1 WHERE id = $2 AND usuario_id = $3 RETURNING *',
            [monto, id, user.id]
        )
        return {
            ...res.rows[0],
            saldo_actual: parseFloat(res.rows[0].saldo_actual)
        }
    } catch (e: any) {
        return reply.status(500).send({ error: `Error retirando de alcancía: ${e.message}` })
    }
}
