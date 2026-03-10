"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCreditCard = exports.updateCreditCard = exports.getCreditCards = exports.createCreditCard = void 0;
const db_1 = require("../db");
const createCreditCard = async (req, reply) => {
    const user = req.user;
    const { nombre, dia_corte, dia_pago } = req.body;
    if (!nombre || !dia_corte) {
        return reply.status(400).send({ error: 'Faltan campos obligatorios (nombre, dia_corte)' });
    }
    try {
        const res = await (0, db_1.query)('INSERT INTO tarjetas_credito (usuario_id, nombre, dia_corte, dia_pago) VALUES ($1, $2, $3, $4) RETURNING id, nombre, dia_corte, dia_pago', [user.id, nombre, dia_corte, dia_pago]);
        return reply.status(201).send(res.rows[0]);
    }
    catch (e) {
        return reply.status(500).send({ error: `Error creando tarjeta: ${e.message}` });
    }
};
exports.createCreditCard = createCreditCard;
const getCreditCards = async (req, reply) => {
    const user = req.user;
    try {
        const res = await (0, db_1.query)('SELECT id, nombre, dia_corte, dia_pago FROM tarjetas_credito WHERE usuario_id = $1 ORDER BY id ASC', [user.id]);
        return res.rows;
    }
    catch (e) {
        return reply.status(500).send({ error: `Error obteniendo tarjetas: ${e.message}` });
    }
};
exports.getCreditCards = getCreditCards;
const updateCreditCard = async (req, reply) => {
    const user = req.user;
    const { id } = req.params;
    const { nombre, dia_corte, dia_pago } = req.body;
    if (!nombre || !dia_corte) {
        return reply.status(400).send({ error: 'Faltan campos obligatorios' });
    }
    try {
        const res = await (0, db_1.query)('UPDATE tarjetas_credito SET nombre = $1, dia_corte = $2, dia_pago = $3 WHERE id = $4 AND usuario_id = $5 RETURNING id, nombre, dia_corte, dia_pago', [nombre, dia_corte, dia_pago, id, user.id]);
        if (res.rowCount === 0)
            return reply.status(404).send({ error: 'Tarjeta no encontrada' });
        return res.rows[0];
    }
    catch (e) {
        return reply.status(500).send({ error: `Error actualizando tarjeta: ${e.message}` });
    }
};
exports.updateCreditCard = updateCreditCard;
const deleteCreditCard = async (req, reply) => {
    const user = req.user;
    const { id } = req.params;
    try {
        const res = await (0, db_1.query)('DELETE FROM tarjetas_credito WHERE id = $1 AND usuario_id = $2 RETURNING id', [id, user.id]);
        if (res.rowCount === 0)
            return reply.status(404).send({ error: 'Tarjeta no encontrada' });
        return { message: 'Tarjeta eliminada', deletedId: res.rows[0].id };
    }
    catch (e) {
        return reply.status(500).send({ error: `Error eliminando tarjeta: ${e.message}` });
    }
};
exports.deleteCreditCard = deleteCreditCard;
