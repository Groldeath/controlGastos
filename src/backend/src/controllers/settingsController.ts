import { FastifyRequest, FastifyReply } from 'fastify'
import { query } from '../db'

const DEFAULT_TEMA = 'dark'
const DEFAULT_MOSTRAR_GASTO_CORTE = true

export const getSettings = async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as { id: number }

    try {
        const res = await query(
            'SELECT tema, mostrar_gasto_corte FROM ajustes_usuario WHERE usuario_id = $1',
            [user.id]
        )

        if (res.rowCount === 0) {
            return { tema: DEFAULT_TEMA, mostrar_gasto_corte: DEFAULT_MOSTRAR_GASTO_CORTE }
        }

        return {
            tema: res.rows[0].tema,
            mostrar_gasto_corte: res.rows[0].mostrar_gasto_corte
        }
    } catch (e: any) {
        req.log.error(`Error obteniendo ajustes: ${e.message}`)
        return reply.status(500).send({ error: 'Error interno del servidor' })
    }
}

export const updateSettings = async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as { id: number }
    const { tema, mostrar_gasto_corte } = req.body as any

    if (tema !== undefined && tema !== 'dark' && tema !== 'light') {
        return reply.status(400).send({ error: 'El tema debe ser "dark" o "light"' })
    }
    if (mostrar_gasto_corte !== undefined && typeof mostrar_gasto_corte !== 'boolean') {
        return reply.status(400).send({ error: 'mostrar_gasto_corte debe ser booleano' })
    }

    const finalTema = tema ?? DEFAULT_TEMA
    const finalMostrar = mostrar_gasto_corte ?? DEFAULT_MOSTRAR_GASTO_CORTE

    try {
        const res = await query(`
            INSERT INTO ajustes_usuario (usuario_id, tema, mostrar_gasto_corte)
            VALUES ($1, $2, $3)
            ON CONFLICT (usuario_id)
            DO UPDATE SET
                tema = EXCLUDED.tema,
                mostrar_gasto_corte = EXCLUDED.mostrar_gasto_corte,
                fecha_actualizacion = CURRENT_TIMESTAMP
            RETURNING tema, mostrar_gasto_corte
        `, [user.id, finalTema, finalMostrar])

        return {
            tema: res.rows[0].tema,
            mostrar_gasto_corte: res.rows[0].mostrar_gasto_corte
        }
    } catch (e: any) {
        req.log.error(`Error actualizando ajustes: ${e.message}`)
        return reply.status(500).send({ error: 'Error interno del servidor' })
    }
}
