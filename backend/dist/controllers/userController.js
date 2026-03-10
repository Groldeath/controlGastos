"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.checkSetupStatus = exports.createUser = exports.getUsers = exports.getProfile = exports.login = exports.setupInitialAdmin = void 0;
const db_1 = require("../db");
const security_1 = require("../utils/security");
const setupInitialAdmin = async (req, reply) => {
    const checkRes = await (0, db_1.query)('SELECT COUNT(*) FROM usuarios');
    if (parseInt(checkRes.rows[0].count) > 0) {
        return reply.status(403).send({ error: 'Setup bloqueado: Ya existen usuarios.' });
    }
    const body = req.body;
    if (!body) {
        return reply.status(400).send({ error: 'El cuerpo de la petición (JSON) es obligatorio' });
    }
    const { nombre_usuario, email, password } = body;
    if (!nombre_usuario || !email || !password) {
        return reply.status(400).send({ error: 'Faltan campos obligatorios' });
    }
    const hashed = await (0, security_1.hashPassword)(password);
    const insertQuery = `
    INSERT INTO usuarios (nombre_usuario, email, hash_contrasena, rol)
    VALUES ($1, $2, $3, 'admin') RETURNING id, nombre_usuario, email, rol, fecha_creacion
  `;
    try {
        const res = await (0, db_1.query)(insertQuery, [nombre_usuario, email, hashed]);
        // Opcionalmente podemos retornar JWT aquí mismo
        const token = await reply.jwtSign({ id: res.rows[0].id, rol: res.rows[0].rol });
        return reply.status(201).send({ message: 'Administrador principal creado', token, user: res.rows[0] });
    }
    catch (error) {
        return reply.status(500).send({ error: `Error creando admin: ${error.message}` });
    }
};
exports.setupInitialAdmin = setupInitialAdmin;
const login = async (req, reply) => {
    const body = req.body;
    if (!body)
        return reply.status(400).send({ error: 'Cuerpo JSON obligatorio' });
    const { email, password } = body;
    const resp = await (0, db_1.query)('SELECT id, nombre_usuario, email, hash_contrasena, rol FROM usuarios WHERE email = $1', [email]);
    if (resp.rows.length === 0) {
        return reply.status(401).send({ error: 'Credenciales inválidas' });
    }
    const user = resp.rows[0];
    const isValid = await (0, security_1.verifyPassword)(password, user.hash_contrasena);
    if (!isValid)
        return reply.status(401).send({ error: 'Credenciales inválidas' });
    const token = await reply.jwtSign({ id: user.id, rol: user.rol }, { expiresIn: '8h' });
    return { token, user: { id: user.id, nombre_usuario: user.nombre_usuario, rol: user.rol } };
};
exports.login = login;
const getProfile = async (req, reply) => {
    const reqUser = req.user;
    const res = await (0, db_1.query)('SELECT id, nombre_usuario, email, rol, fecha_creacion FROM usuarios WHERE id = $1', [reqUser.id]);
    if (res.rows.length === 0)
        return reply.status(404).send({ error: 'Usuario no encontrado' });
    return res.rows[0];
};
exports.getProfile = getProfile;
const getUsers = async (req, reply) => {
    try {
        const res = await (0, db_1.query)('SELECT id, nombre_usuario, email, rol, fecha_creacion FROM usuarios ORDER BY id ASC');
        return res.rows;
    }
    catch (e) {
        return reply.status(500).send({ error: `Error obteniendo usuarios: ${e.message}` });
    }
};
exports.getUsers = getUsers;
const createUser = async (req, reply) => {
    // Si llegó hasta aquí, el plugin `requireAdmin` ya validó el JWT y el rol.
    const body = req.body;
    if (!body)
        return reply.status(400).send({ error: 'Cuerpo JSON obligatorio' });
    const { nombre_usuario, email, password, rol } = body;
    const hashed = await (0, security_1.hashPassword)(password);
    try {
        const res = await (0, db_1.query)('INSERT INTO usuarios (nombre_usuario, email, hash_contrasena, rol) VALUES ($1, $2, $3, $4) RETURNING id', [nombre_usuario, email, hashed, rol || 'usuario']);
        return reply.status(201).send({ message: 'Usuario creado exitosamente', id: res.rows[0].id });
    }
    catch (e) {
        return reply.status(500).send({ error: `Error creando usuario: ${e.message}` });
    }
};
exports.createUser = createUser;
const checkSetupStatus = async (req, reply) => {
    try {
        const resp = await (0, db_1.query)('SELECT COUNT(*) FROM usuarios');
        const count = parseInt(resp.rows[0].count);
        return reply.send({ requireSetup: count === 0 });
    }
    catch (e) {
        return reply.status(500).send({ error: `Error verificando setup: ${e.message}` });
    }
};
exports.checkSetupStatus = checkSetupStatus;
const updateUser = async (req, reply) => {
    const { id } = req.params;
    const body = req.body;
    if (!body)
        return reply.status(400).send({ error: 'Cuerpo JSON obligatorio' });
    const { nombre_usuario, password, rol } = body;
    try {
        if (password) {
            const hashed = await (0, security_1.hashPassword)(password);
            await (0, db_1.query)('UPDATE usuarios SET nombre_usuario = $1, hash_contrasena = $2, rol = $3 WHERE id = $4', [nombre_usuario, hashed, rol, id]);
        }
        else {
            await (0, db_1.query)('UPDATE usuarios SET nombre_usuario = $1, rol = $2 WHERE id = $3', [nombre_usuario, rol, id]);
        }
        return reply.send({ message: 'Usuario actualizado exitosamente' });
    }
    catch (e) {
        return reply.status(500).send({ error: `Error actualizando usuario: ${e.message}` });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, reply) => {
    const { id } = req.params;
    const adminUser = req.user;
    if (parseInt(id) === adminUser.id) {
        return reply.status(400).send({ error: 'No puedes eliminar tu propio usuario' });
    }
    try {
        const res = await (0, db_1.query)('DELETE FROM usuarios WHERE id = $1 RETURNING id', [id]);
        if (res.rowCount === 0)
            return reply.status(404).send({ error: 'Usuario no encontrado' });
        return reply.send({ message: 'Usuario eliminado' });
    }
    catch (e) {
        // Handle FK cascade issues if transacciones depends on it (depends on schema)
        return reply.status(500).send({ error: `Error al eliminar usuario, posiblemente tiene datos asociados: ${e.message}` });
    }
};
exports.deleteUser = deleteUser;
