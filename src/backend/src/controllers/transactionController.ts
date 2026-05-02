import { FastifyRequest, FastifyReply } from 'fastify'
import { query } from '../db'

export const createTransaction = async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as { id: number }
    const { tipo, monto, categoria_id, tarjeta_credito_id, presupuesto_id, descripcion, fecha } = req.body as any

    if (!tipo || !monto || !fecha || !descripcion) {
        return reply.status(400).send({ error: 'Campos obligatorios faltantes (tipo, monto, fecha, descripcion)' })
    }

    if (tipo !== 'ingreso' && tipo !== 'gasto' && tipo !== 'ahorro') {
        return reply.status(400).send({ error: 'El tipo debe ser ingreso, gasto o ahorro' })
    }

    let finalCategoriaId = categoria_id || null;
    let finalTarjetaId = tarjeta_credito_id || null;
    let finalPresupuestoId = presupuesto_id || null;

    if (tipo !== 'gasto') {
        finalCategoriaId = null;
        finalTarjetaId = null;
        finalPresupuestoId = null;
    }

    try {
        const res = await query(
            `INSERT INTO transacciones (usuario_id, tipo, monto, categoria_id, tarjeta_credito_id, presupuesto_id, descripcion, fecha) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [user.id, tipo, monto, finalCategoriaId, finalTarjetaId, finalPresupuestoId, descripcion, fecha]
        )
        return reply.status(201).send(res.rows[0])
    } catch (e: any) {
        return reply.status(500).send({ error: `Error creando transacción: ${e.message}` })
    }
}

export const getTransactions = async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as { id: number }
    const { limit = 10, offset = 0, month, year } = req.query as any

    let whereClause = 't.usuario_id = $1'
    let queryParams: any[] = [user.id]

    // Filtro Opcional por Mes y Año (RN1.3)
    if (month && year) {
        whereClause += ` AND EXTRACT(MONTH FROM t.fecha) = $${queryParams.length + 1}`
        queryParams.push(parseInt(month))
        whereClause += ` AND EXTRACT(YEAR FROM t.fecha) = $${queryParams.length + 1}`
        queryParams.push(parseInt(year))
    }

    // Parámetros de paginación
    const limitQuery = ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`

    const countQuery = `SELECT COUNT(*) FROM transacciones t WHERE ${whereClause}`
    const dataQuery = `
        SELECT 
            t.id, t.tipo, t.monto, t.descripcion, t.fecha, t.fecha_creacion,
            c.id as categoria_id, c.nombre as categoria_nombre,
            tc.id as tarjeta_id, tc.nombre as tarjeta_nombre,
            p.id as presupuesto_id, p.nombre as presupuesto_nombre
        FROM transacciones t
        LEFT JOIN categorias c ON t.categoria_id = c.id
        LEFT JOIN tarjetas_credito tc ON t.tarjeta_credito_id = tc.id
        LEFT JOIN presupuestos p ON t.presupuesto_id = p.id
        WHERE ${whereClause}
        ORDER BY t.fecha DESC, t.id DESC
        ${limitQuery}
    `

    try {
        const dataRes = await query(dataQuery, [...queryParams, parseInt(limit), parseInt(offset)])
        const countRes = await query(countQuery, queryParams)

        // Mapear los resultados para agrupar category y card
        const formattedData = dataRes.rows.map(row => ({
            id: row.id,
            tipo: row.tipo,
            monto: row.monto,
            descripcion: row.descripcion,
            fecha: row.fecha,
            fecha_creacion: row.fecha_creacion,
            categoria: row.categoria_id ? { id: row.categoria_id, nombre: row.categoria_nombre } : null,
            tarjeta: row.tarjeta_id ? { id: row.tarjeta_id, nombre: row.tarjeta_nombre } : null,
            presupuesto: row.presupuesto_id ? { id: row.presupuesto_id, nombre: row.presupuesto_nombre } : null
        }))

        return {
            total: parseInt(countRes.rows[0].count),
            limit: parseInt(limit),
            offset: parseInt(offset),
            data: formattedData
        }
    } catch (e: any) {
        return reply.status(500).send({ error: `Error obteniendo transacciones: ${e.message}` })
    }
}

export const updateTransaction = async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as { id: number }
    const { id } = req.params as { id: string }
    const { tipo, monto, categoria_id, tarjeta_credito_id, presupuesto_id, descripcion, fecha } = req.body as any

    if (!tipo || !monto || !fecha || !descripcion) {
        return reply.status(400).send({ error: 'Campos obligatorios faltantes (tipo, monto, fecha, descripcion)' })
    }

    if (tipo !== 'ingreso' && tipo !== 'gasto' && tipo !== 'ahorro') {
        return reply.status(400).send({ error: 'El tipo debe ser ingreso, gasto o ahorro' })
    }

    let finalCategoriaId = tipo === 'gasto' && categoria_id ? parseInt(categoria_id) : null;
    let finalTarjetaId = tipo === 'gasto' && tarjeta_credito_id ? parseInt(tarjeta_credito_id) : null;
    let finalPresupuestoId = tipo === 'gasto' && presupuesto_id ? parseInt(presupuesto_id) : null;

    try {
        const updateQuery = `
            UPDATE transacciones 
            SET tipo = $1, monto = $2, categoria_id = $3, tarjeta_credito_id = $4, presupuesto_id = $5, descripcion = $6, fecha = $7
            WHERE id = $8 AND usuario_id = $9 RETURNING *
        `
        const res = await query(updateQuery, [tipo, monto, finalCategoriaId, finalTarjetaId, finalPresupuestoId, descripcion, fecha, id, user.id])

        if (res.rowCount === 0) return reply.status(404).send({ error: 'Transacción no encontrada o no pertenece al usuario' })

        return res.rows[0]
    } catch (e: any) {
        return reply.status(500).send({ error: `Error actualizando transacción: ${e.message}` })
    }
}

export const deleteTransaction = async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as { id: number }
    const { id } = req.params as { id: string }

    try {
        const res = await query('DELETE FROM transacciones WHERE id = $1 AND usuario_id = $2 RETURNING id', [id, user.id])
        if (res.rowCount === 0) return reply.status(404).send({ error: 'Transacción no encontrada' })
        return { message: 'Transacción eliminada', deletedId: res.rows[0].id }
    } catch (e: any) {
        return reply.status(500).send({ error: `Error eliminando transacción: ${e.message}` })
    }
}

export const getActiveMonths = async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as { id: number }
    try {
        const res = await query(`
            SELECT DISTINCT 
                EXTRACT(YEAR FROM fecha) as year, 
                EXTRACT(MONTH FROM fecha) as month 
            FROM transacciones 
            WHERE usuario_id = $1 
            ORDER BY year DESC, month DESC
        `, [user.id])

        return res.rows.map(row => ({
            year: parseInt(row.year),
            month: parseInt(row.month)
        }))
    } catch (e: any) {
        return reply.status(500).send({ error: `Error obteniendo meses activos: ${e.message}` })
    }
}

export const getSummary = async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as { id: number }
    const { month, year } = req.query as any

    let whereClause = 'usuario_id = $1'
    let queryParams: any[] = [user.id]

    if (month && year) {
        whereClause += ` AND EXTRACT(MONTH FROM fecha) = $${queryParams.length + 1}`
        queryParams.push(parseInt(month))
        whereClause += ` AND EXTRACT(YEAR FROM fecha) = $${queryParams.length + 1}`
        queryParams.push(parseInt(year))
    }

    try {
        const res = await query(`
            SELECT tipo, SUM(monto) as total
            FROM transacciones
            WHERE ${whereClause}
            GROUP BY tipo
        `, queryParams)

        let ingresos = 0
        let gastos = 0

        res.rows.forEach(row => {
            if (row.tipo === 'ingreso') ingresos = parseFloat(row.total)
            if (row.tipo === 'gasto') gastos = parseFloat(row.total)
        })

        // Obtener límite total de presupuestos del mes y gastos no presupuestados
        let sumaPresupuestos = 0;
        let gastosSinPresupuesto = 0;

        if (month && year) {
            const presupuestosRes = await query(`
                SELECT SUM(monto_limite) as total 
                FROM presupuestos 
                WHERE usuario_id = $1 AND mes = $2 AND anio = $3
            `, [user.id, parseInt(month), parseInt(year)])
            sumaPresupuestos = presupuestosRes.rows[0].total ? parseFloat(presupuestosRes.rows[0].total) : 0;

            const sinPresupuestoRes = await query(`
                SELECT SUM(monto) as total
                FROM transacciones
                WHERE usuario_id = $1 AND tipo = 'gasto' AND presupuesto_id IS NULL
                AND EXTRACT(MONTH FROM fecha) = $2 AND EXTRACT(YEAR FROM fecha) = $3
            `, [user.id, parseInt(month), parseInt(year)])
            gastosSinPresupuesto = sinPresupuestoRes.rows[0].total ? parseFloat(sinPresupuestoRes.rows[0].total) : 0;
        }

        // Calculo de ahorro total (historico completo sin filtro de mes/año)
        const ahorroRes = await query(`
            SELECT SUM(monto) as total
            FROM transacciones
            WHERE usuario_id = $1 AND tipo = 'ahorro'
        `, [user.id])

        const ahorroTotal = ahorroRes.rows[0].total ? parseFloat(ahorroRes.rows[0].total) : 0

        // Gastos por categoria (del mes)
        const catRes = await query(`
            SELECT c.nombre, SUM(t.monto) as total
            FROM transacciones t
            JOIN categorias c ON t.categoria_id = c.id
            WHERE t.tipo = 'gasto' AND t.${whereClause.replace('usuario_id', 'usuario_id')}
            GROUP BY c.id, c.nombre
            ORDER BY total DESC
        `, queryParams)

        const gastosPorCategoria = catRes.rows.map(r => ({ nombre: r.nombre, total: parseFloat(r.total) }))

        // Gastos por tarjeta (usando la ventana de fecha de corte)
        let tarjWhereClause = 't.tipo = $1 AND t.usuario_id = $2';
        let tarjQueryParams: any[] = ['gasto', user.id];
        
        if (month && year) {
            tarjWhereClause += `
                AND t.fecha > LEAST(
                    make_date(($4)::int, ($3)::int, 1) - interval '1 month' + (tc.dia_corte - 1) * interval '1 day',
                    make_date(($4)::int, ($3)::int, 1) - interval '1 day'
                )::DATE
                AND t.fecha <= LEAST(
                    make_date(($4)::int, ($3)::int, 1) + (tc.dia_corte - 1) * interval '1 day',
                    make_date(($4)::int, ($3)::int, 1) + interval '1 month - 1 day'
                )::DATE
            `;
            // Push values for $3 and $4
            tarjQueryParams.push(parseInt(month));
            tarjQueryParams.push(parseInt(year));
        }

        const tarjRes = await query(`
            SELECT tc.nombre, tc.dia_corte, tc.dia_pago, SUM(t.monto) as total
            FROM transacciones t
            JOIN tarjetas_credito tc ON t.tarjeta_credito_id = tc.id
            WHERE ${tarjWhereClause}
            GROUP BY tc.id, tc.nombre, tc.dia_corte, tc.dia_pago
            ORDER BY total DESC
        `, tarjQueryParams)

        const gastosPorTarjeta = tarjRes.rows.map(r => ({
            nombre: r.nombre,
            total: parseFloat(r.total),
            dia_corte: r.dia_corte,
            dia_pago: r.dia_pago
        }))

        return {
            ingresos,
            gastos,
            balance: ingresos - gastos,
            balanceNetoReal: ingresos - sumaPresupuestos - gastosSinPresupuesto,
            sumaPresupuestos,
            gastosSinPresupuesto,
            ahorroTotal,
            gastosPorCategoria,
            gastosPorTarjeta
        }
    } catch (e: any) {
        return reply.status(500).send({ error: `Error obteniendo resumen: ${e.message}` })
    }
}
