"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSummary = exports.getActiveMonths = exports.deleteTransaction = exports.updateTransaction = exports.getTransactions = exports.createTransaction = void 0;
const db_1 = require("../db");
const createTransaction = async (req, reply) => {
    const user = req.user;
    const { tipo, monto, categoria_id, tarjeta_credito_id, descripcion, fecha } = req.body;
    if (!tipo || !monto || !fecha || !descripcion) {
        return reply.status(400).send({ error: 'Campos obligatorios faltantes (tipo, monto, fecha, descripcion)' });
    }
    if (tipo !== 'ingreso' && tipo !== 'gasto' && tipo !== 'ahorro') {
        return reply.status(400).send({ error: 'El tipo debe ser ingreso, gasto o ahorro' });
    }
    let finalCategoriaId = categoria_id || null;
    let finalTarjetaId = tarjeta_credito_id || null;
    if (tipo !== 'gasto') {
        finalCategoriaId = null;
        finalTarjetaId = null;
    }
    try {
        const res = await (0, db_1.query)(`INSERT INTO transacciones (usuario_id, tipo, monto, categoria_id, tarjeta_credito_id, descripcion, fecha) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [user.id, tipo, monto, finalCategoriaId, finalTarjetaId, descripcion, fecha]);
        return reply.status(201).send(res.rows[0]);
    }
    catch (e) {
        return reply.status(500).send({ error: `Error creando transacción: ${e.message}` });
    }
};
exports.createTransaction = createTransaction;
const getTransactions = async (req, reply) => {
    const user = req.user;
    const { limit = 10, offset = 0, month, year } = req.query;
    let whereClause = 't.usuario_id = $1';
    let queryParams = [user.id];
    // Filtro Opcional por Mes y Año (RN1.3)
    if (month && year) {
        whereClause += ` AND EXTRACT(MONTH FROM t.fecha) = $${queryParams.length + 1}`;
        queryParams.push(parseInt(month));
        whereClause += ` AND EXTRACT(YEAR FROM t.fecha) = $${queryParams.length + 1}`;
        queryParams.push(parseInt(year));
    }
    // Parámetros de paginación
    const limitQuery = ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    const countQuery = `SELECT COUNT(*) FROM transacciones t WHERE ${whereClause}`;
    const dataQuery = `
        SELECT 
            t.id, t.tipo, t.monto, t.descripcion, t.fecha, t.fecha_creacion,
            c.id as categoria_id, c.nombre as categoria_nombre,
            tc.id as tarjeta_id, tc.nombre as tarjeta_nombre
        FROM transacciones t
        LEFT JOIN categorias c ON t.categoria_id = c.id
        LEFT JOIN tarjetas_credito tc ON t.tarjeta_credito_id = tc.id
        WHERE ${whereClause}
        ORDER BY t.fecha DESC, t.id DESC
        ${limitQuery}
    `;
    try {
        const dataRes = await (0, db_1.query)(dataQuery, [...queryParams, parseInt(limit), parseInt(offset)]);
        const countRes = await (0, db_1.query)(countQuery, queryParams);
        // Mapear los resultados para agrupar category y card
        const formattedData = dataRes.rows.map(row => ({
            id: row.id,
            tipo: row.tipo,
            monto: row.monto,
            descripcion: row.descripcion,
            fecha: row.fecha,
            fecha_creacion: row.fecha_creacion,
            categoria: row.categoria_id ? { id: row.categoria_id, nombre: row.categoria_nombre } : null,
            tarjeta: row.tarjeta_id ? { id: row.tarjeta_id, nombre: row.tarjeta_nombre } : null
        }));
        return {
            total: parseInt(countRes.rows[0].count),
            limit: parseInt(limit),
            offset: parseInt(offset),
            data: formattedData
        };
    }
    catch (e) {
        return reply.status(500).send({ error: `Error obteniendo transacciones: ${e.message}` });
    }
};
exports.getTransactions = getTransactions;
const updateTransaction = async (req, reply) => {
    const user = req.user;
    const { id } = req.params;
    const { tipo, monto, categoria_id, tarjeta_credito_id, descripcion, fecha } = req.body;
    if (!tipo || !monto || !fecha || !descripcion) {
        return reply.status(400).send({ error: 'Campos obligatorios faltantes (tipo, monto, fecha, descripcion)' });
    }
    if (tipo !== 'ingreso' && tipo !== 'gasto' && tipo !== 'ahorro') {
        return reply.status(400).send({ error: 'El tipo debe ser ingreso, gasto o ahorro' });
    }
    let finalCategoriaId = tipo === 'gasto' && categoria_id ? parseInt(categoria_id) : null;
    let finalTarjetaId = tipo === 'gasto' && tarjeta_credito_id ? parseInt(tarjeta_credito_id) : null;
    try {
        const updateQuery = `
            UPDATE transacciones 
            SET tipo = $1, monto = $2, categoria_id = $3, tarjeta_credito_id = $4, descripcion = $5, fecha = $6
            WHERE id = $7 AND usuario_id = $8 RETURNING *
        `;
        const res = await (0, db_1.query)(updateQuery, [tipo, monto, finalCategoriaId, finalTarjetaId, descripcion, fecha, id, user.id]);
        if (res.rowCount === 0)
            return reply.status(404).send({ error: 'Transacción no encontrada o no pertenece al usuario' });
        return res.rows[0];
    }
    catch (e) {
        return reply.status(500).send({ error: `Error actualizando transacción: ${e.message}` });
    }
};
exports.updateTransaction = updateTransaction;
const deleteTransaction = async (req, reply) => {
    const user = req.user;
    const { id } = req.params;
    try {
        const res = await (0, db_1.query)('DELETE FROM transacciones WHERE id = $1 AND usuario_id = $2 RETURNING id', [id, user.id]);
        if (res.rowCount === 0)
            return reply.status(404).send({ error: 'Transacción no encontrada' });
        return { message: 'Transacción eliminada', deletedId: res.rows[0].id };
    }
    catch (e) {
        return reply.status(500).send({ error: `Error eliminando transacción: ${e.message}` });
    }
};
exports.deleteTransaction = deleteTransaction;
const getActiveMonths = async (req, reply) => {
    const user = req.user;
    try {
        const res = await (0, db_1.query)(`
            SELECT DISTINCT 
                EXTRACT(YEAR FROM fecha) as year, 
                EXTRACT(MONTH FROM fecha) as month 
            FROM transacciones 
            WHERE usuario_id = $1 
            ORDER BY year DESC, month DESC
        `, [user.id]);
        return res.rows.map(row => ({
            year: parseInt(row.year),
            month: parseInt(row.month)
        }));
    }
    catch (e) {
        return reply.status(500).send({ error: `Error obteniendo meses activos: ${e.message}` });
    }
};
exports.getActiveMonths = getActiveMonths;
const getSummary = async (req, reply) => {
    const user = req.user;
    const { month, year } = req.query;
    let whereClause = 'usuario_id = $1';
    let queryParams = [user.id];
    if (month && year) {
        whereClause += ` AND EXTRACT(MONTH FROM fecha) = $${queryParams.length + 1}`;
        queryParams.push(parseInt(month));
        whereClause += ` AND EXTRACT(YEAR FROM fecha) = $${queryParams.length + 1}`;
        queryParams.push(parseInt(year));
    }
    try {
        const res = await (0, db_1.query)(`
            SELECT tipo, SUM(monto) as total
            FROM transacciones
            WHERE ${whereClause}
            GROUP BY tipo
        `, queryParams);
        let ingresos = 0;
        let gastos = 0;
        res.rows.forEach(row => {
            if (row.tipo === 'ingreso')
                ingresos = parseFloat(row.total);
            if (row.tipo === 'gasto')
                gastos = parseFloat(row.total);
        });
        // Calculo de ahorro total (historico completo sin filtro de mes/año)
        const ahorroRes = await (0, db_1.query)(`
            SELECT SUM(monto) as total
            FROM transacciones
            WHERE usuario_id = $1 AND tipo = 'ahorro'
        `, [user.id]);
        const ahorroTotal = ahorroRes.rows[0].total ? parseFloat(ahorroRes.rows[0].total) : 0;
        // Gastos por categoria (del mes)
        const catRes = await (0, db_1.query)(`
            SELECT c.nombre, SUM(t.monto) as total
            FROM transacciones t
            JOIN categorias c ON t.categoria_id = c.id
            WHERE t.tipo = 'gasto' AND t.${whereClause.replace('usuario_id', 'usuario_id')}
            GROUP BY c.id, c.nombre
            ORDER BY total DESC
            LIMIT 5
        `, queryParams);
        const gastosPorCategoria = catRes.rows.map(r => ({ nombre: r.nombre, total: parseFloat(r.total) }));
        // Gastos por tarjeta (del mes)
        const tarjRes = await (0, db_1.query)(`
            SELECT tc.nombre, tc.dia_corte, tc.dia_pago, SUM(t.monto) as total
            FROM transacciones t
            JOIN tarjetas_credito tc ON t.tarjeta_credito_id = tc.id
            WHERE t.tipo = 'gasto' AND t.${whereClause.replace('usuario_id', 'usuario_id')}
            GROUP BY tc.id, tc.nombre, tc.dia_corte, tc.dia_pago
            ORDER BY total DESC
            LIMIT 5
        `, queryParams);
        const gastosPorTarjeta = tarjRes.rows.map(r => ({
            nombre: r.nombre,
            total: parseFloat(r.total),
            dia_corte: r.dia_corte,
            dia_pago: r.dia_pago
        }));
        return {
            ingresos,
            gastos,
            balance: ingresos - gastos,
            ahorroTotal,
            gastosPorCategoria,
            gastosPorTarjeta
        };
    }
    catch (e) {
        return reply.status(500).send({ error: `Error obteniendo resumen: ${e.message}` });
    }
};
exports.getSummary = getSummary;
