import { FastifyRequest, FastifyReply } from 'fastify'
import { query } from '../db'
import { hashPassword, verifyPassword } from '../utils/security'

export const setupInitialAdmin = async (req: FastifyRequest, reply: FastifyReply) => {
    const checkRes = await query('SELECT COUNT(*) FROM usuarios')
    if (parseInt(checkRes.rows[0].count) > 0) {
        return reply.status(403).send({ error: 'Setup bloqueado: Ya existen usuarios.' })
    }

    const body = req.body as any
    if (!body) {
        return reply.status(400).send({ error: 'El cuerpo de la petición (JSON) es obligatorio' })
    }

    const { nombre_usuario, email, password } = body
    if (!nombre_usuario || !email || !password) {
        return reply.status(400).send({ error: 'Faltan campos obligatorios' })
    }

    if (password.length < 8) {
        return reply.status(400).send({ error: 'La contraseña debe tener al menos 8 caracteres' })
    }

    const hashed = await hashPassword(password)

    const insertQuery = `
    INSERT INTO usuarios (nombre_usuario, email, hash_contrasena, rol)
    VALUES ($1, $2, $3, 'admin') RETURNING id, nombre_usuario, email, rol, fecha_creacion
  `
    try {
        const res = await query(insertQuery, [nombre_usuario, email, hashed])
        // Opcionalmente podemos retornar JWT aquí mismo
        const token = await reply.jwtSign({ id: res.rows[0].id, rol: res.rows[0].rol })
        return reply.status(201).send({ message: 'Administrador principal creado', token, user: res.rows[0] })
    } catch (error: any) {
        req.log.error(`Error creando admin: ${error.message}`)
        return reply.status(500).send({ error: 'Error interno del servidor' })
    }
}

export const login = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = req.body as any
    if (!body) return reply.status(400).send({ error: 'Cuerpo JSON obligatorio' })

    const { email, password } = body

    if (!email || !password) {
        return reply.status(401).send({ error: 'Credenciales inválidas' })
    }

    const resp = await query('SELECT id, nombre_usuario, email, hash_contrasena, rol, oidc_id FROM usuarios WHERE email = $1', [email])

    if (resp.rows.length === 0) {
        return reply.status(401).send({ error: 'Credenciales inválidas' })
    }
    const user = resp.rows[0]

    // Usuarios OIDC no tienen contraseña local
    if (user.oidc_id && user.hash_contrasena === 'sso-account-no-local-password') {
        return reply.status(401).send({ error: 'Esta cuenta usa inicio de sesión con OIDC. Usa el botón de acceso externo.' })
    }

    const isValid = await verifyPassword(password, user.hash_contrasena)
    if (!isValid) return reply.status(401).send({ error: 'Credenciales inválidas' })

    const token = await reply.jwtSign({ id: user.id, rol: user.rol }, { expiresIn: '8h' })
    return { token, user: { id: user.id, nombre_usuario: user.nombre_usuario, email: user.email, rol: user.rol } }
}

export const getProfile = async (req: FastifyRequest, reply: FastifyReply) => {
    const reqUser = req.user as { id: number }
    const res = await query('SELECT id, nombre_usuario, email, rol, fecha_creacion FROM usuarios WHERE id = $1', [reqUser.id])
    if (res.rows.length === 0) return reply.status(404).send({ error: 'Usuario no encontrado' })
    return res.rows[0]
}

export const getUsers = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const res = await query('SELECT id, nombre_usuario, email, rol, fecha_creacion FROM usuarios ORDER BY id ASC')
        return res.rows
    } catch (e: any) {
        req.log.error(`Error obteniendo usuarios: ${e.message}`)
        return reply.status(500).send({ error: 'Error interno del servidor' })
    }
}

export const createUser = async (req: FastifyRequest, reply: FastifyReply) => {
    // Si llegó hasta aquí, el plugin `requireAdmin` ya validó el JWT y el rol.
    const body = req.body as any
    if (!body) return reply.status(400).send({ error: 'Cuerpo JSON obligatorio' })

    const { nombre_usuario, email, password, rol } = body

    if (!nombre_usuario || !email || !password) {
        return reply.status(400).send({ error: 'Campos obligatorios faltantes' })
    }

    if (password.length < 8) {
        return reply.status(400).send({ error: 'La contraseña debe tener al menos 8 caracteres' })
    }

    const hashed = await hashPassword(password)

    try {
        const res = await query('INSERT INTO usuarios (nombre_usuario, email, hash_contrasena, rol) VALUES ($1, $2, $3, $4) RETURNING id',
            [nombre_usuario, email, hashed, rol || 'usuario'])
        return reply.status(201).send({ message: 'Usuario creado exitosamente', id: res.rows[0].id })
    } catch (e: any) {
        req.log.error(`Error creando usuario: ${e.message}`)
        return reply.status(500).send({ error: 'Error interno del servidor' })
    }
}

export const checkSetupStatus = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const resp = await query('SELECT COUNT(*) FROM usuarios')
        const count = parseInt(resp.rows[0].count)
        return reply.send({ requireSetup: count === 0 })
    } catch (e: any) {
        req.log.error(`Error verificando setup: ${e.message}`)
        return reply.status(500).send({ error: 'Error interno del servidor' })
    }
}

export const updateUser = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string }
    const body = req.body as any
    if (!body) return reply.status(400).send({ error: 'Cuerpo JSON obligatorio' })

    const { nombre_usuario, password, rol } = body

    try {
        if (password) {
            const hashed = await hashPassword(password)
            await query('UPDATE usuarios SET nombre_usuario = $1, hash_contrasena = $2, rol = $3 WHERE id = $4', [nombre_usuario, hashed, rol, id])
        } else {
            await query('UPDATE usuarios SET nombre_usuario = $1, rol = $2 WHERE id = $3', [nombre_usuario, rol, id])
        }
        return reply.send({ message: 'Usuario actualizado exitosamente' })
    } catch (e: any) {
        req.log.error(`Error actualizando usuario: ${e.message}`)
        return reply.status(500).send({ error: 'Error interno del servidor' })
    }
}

export const deleteUser = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string }
    const adminUser = req.user as { id: number }

    if (parseInt(id) === adminUser.id) {
        return reply.status(400).send({ error: 'No puedes eliminar tu propio usuario' })
    }

    try {
        const res = await query('DELETE FROM usuarios WHERE id = $1 RETURNING id', [id])
        if (res.rowCount === 0) return reply.status(404).send({ error: 'Usuario no encontrado' })
        return reply.send({ message: 'Usuario eliminado' })
    } catch (e: any) {
        req.log.error(`Error eliminando usuario: ${e.message}`)
        return reply.status(500).send({ error: 'Error interno del servidor' })
    }
}
