"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategories = exports.createCategory = void 0;
const db_1 = require("../db");
const createCategory = async (req, reply) => {
    const user = req.user;
    const { nombre } = req.body;
    if (!nombre)
        return reply.status(400).send({ error: 'El nombre de la categoría es obligatorio' });
    try {
        const res = await (0, db_1.query)('INSERT INTO categorias (usuario_id, nombre) VALUES ($1, $2) RETURNING *', [user.id, nombre]);
        return reply.status(201).send(res.rows[0]);
    }
    catch (e) {
        return reply.status(500).send({ error: `Error creando categoría: ${e.message}` });
    }
};
exports.createCategory = createCategory;
const getCategories = async (req, reply) => {
    const user = req.user;
    try {
        const res = await (0, db_1.query)('SELECT * FROM categorias WHERE usuario_id = $1 ORDER BY nombre ASC', [user.id]);
        return res.rows;
    }
    catch (e) {
        return reply.status(500).send({ error: `Error obteniendo categorías: ${e.message}` });
    }
};
exports.getCategories = getCategories;
const updateCategory = async (req, reply) => {
    const user = req.user;
    const { id } = req.params;
    const { nombre } = req.body;
    if (!nombre)
        return reply.status(400).send({ error: 'El nombre es obligatorio para actualizar' });
    try {
        const res = await (0, db_1.query)('UPDATE categorias SET nombre = $1 WHERE id = $2 AND usuario_id = $3 RETURNING *', [nombre, id, user.id]);
        if (res.rowCount === 0)
            return reply.status(404).send({ error: 'Categoría no encontrada o no pertenece al usuario' });
        return res.rows[0];
    }
    catch (e) {
        return reply.status(500).send({ error: `Error actualizando categoría: ${e.message}` });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, reply) => {
    const user = req.user;
    const { id } = req.params;
    try {
        // PostgreSql maneja ON DELETE SET NULL para las transacciones asociadas gracias al DDL
        const res = await (0, db_1.query)('DELETE FROM categorias WHERE id = $1 AND usuario_id = $2 RETURNING id', [id, user.id]);
        if (res.rowCount === 0)
            return reply.status(404).send({ error: 'Categoría no encontrada o no pertenece al usuario' });
        return { message: 'Categoría eliminada', deletedId: res.rows[0].id };
    }
    catch (e) {
        return reply.status(500).send({ error: `Error eliminando categoría: ${e.message}` });
    }
};
exports.deleteCategory = deleteCategory;
