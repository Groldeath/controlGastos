import { FastifyRequest, FastifyReply } from 'fastify'
import { query } from '../db'
import { Issuer, BaseClient } from 'openid-client'

let oidcClient: BaseClient | null = null;

// Inicialización perezosa (lazy load) del cliente OIDC
async function getOidcClient() {
    if (oidcClient) return oidcClient;
    
    const issuerUrl = process.env.OIDC_ISSUER_URL;
    if (!issuerUrl) throw new Error("OIDC_ISSUER_URL no configurado");

    const issuer = await Issuer.discover(issuerUrl);
    const publicUrl = (process.env.APP_PUBLIC_URL || 'http://localhost:3000').replace(/\/$/, '');

    oidcClient = new issuer.Client({
        client_id: process.env.OIDC_CLIENT_ID || '',
        client_secret: process.env.OIDC_CLIENT_SECRET,
        // El callback siempre apuntará a nuestra API, no al frontend directamente
        redirect_uris: [`${publicUrl}/api/auth/oidc/callback`],
        response_types: ['code']
    });
    return oidcClient;
}

export const oidcLogin = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const client = await getOidcClient();
        // Generamos la URL de autorización
        const url = client.authorizationUrl({
            scope: 'openid email profile',
            // Deshabilitamos nonce para flujo stateless simplificado en este entorno
            nonce: undefined,
        });
        
        return reply.redirect(url);
    } catch (error: any) {
        req.log.error(`Error inicializando OIDC: ${error.message}`);
        return reply.status(500).send({ error: 'Configuración de proveedor de identidad no disponible' });
    }
}

export const oidcCallback = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const client = await getOidcClient();
        const params = client.callbackParams(req.raw.url || req.url);
        
        const tokenSet = await client.callback(client.metadata.redirect_uris![0], params);
        
        const claims = tokenSet.claims();
        req.log.info('OIDC Claims recibidos exitosamente');
        
        if (!claims.sub) {
            return reply.status(400).send({ error: 'Respuesta inválida del proveedor. Falta el identificador (subject)' });
        }

        // Fallback para email si no viene del proveedor (nuestra DB requiere NOT NULL)
        const email = claims.email || `${claims.sub}@oidc.internal`;
        
        // 1. Buscamos al usuario por su OIDC ID
        let resp = await query('SELECT id, nombre_usuario, email, rol, oidc_id FROM usuarios WHERE oidc_id = $1', [claims.sub]);
        let user = resp.rows[0];

        // 2. Si no existe por OIDC ID, buscamos por Email (vincular cuentas preexistentes)
        if (!user) {
            resp = await query('SELECT id, nombre_usuario, email, rol, oidc_id FROM usuarios WHERE email = $1', [email]);
            user = resp.rows[0];
            
            if (user) {
                // Existe, así que lo vinculamos actualizando su oidc_id silenciosamente
                await query('UPDATE usuarios SET oidc_id = $1 WHERE id = $2', [claims.sub, user.id]);
            }
        }

        // 3. Si sigue sin existir, es un usuario totalmente nuevo (Auto-Provisioning)
        if (!user) {
            let chosenName = claims.given_name || claims.name || claims.preferred_username || email.split('@')[0];
            
            // Verificamos si el nombre_usuario ya existe para evitar errores UNIQUE
            const nameCheck = await query('SELECT id FROM usuarios WHERE nombre_usuario = $1', [chosenName]);
            if (nameCheck.rows[0]) {
                // Si existe, le agregamos el inicio del OIDC ID para hacerlo único
                chosenName = `${chosenName}_${claims.sub.substring(0, 5)}`;
            }
            
            const insertQuery = `
                INSERT INTO usuarios (nombre_usuario, email, hash_contrasena, oidc_id, rol)
                VALUES ($1, $2, $3, $4, 'usuario')
                RETURNING id, nombre_usuario, email, rol, oidc_id
            `;
            const dummyHash = 'sso-account-no-local-password'; 
            resp = await query(insertQuery, [chosenName, email, dummyHash, claims.sub]);
            user = resp.rows[0];
        }

        // 4. Generamos el JWT de nuestra propia aplicación tal como el Login local
        const token = await reply.jwtSign({ id: user.id, rol: user.rol }, { expiresIn: '8h' });
        
        // 5. Redirigimos al Frontend con el token en la URL
        const publicUrl = (process.env.APP_PUBLIC_URL || 'http://localhost:3000').replace(/\/$/, '');
        const frontendUrl = `${publicUrl}/auth/callback?token=${token}`;
        
        req.log.info({ userId: user.id }, 'OIDC Login completado, redirigiendo al frontend');
        return reply.redirect(frontendUrl);

    } catch (error: any) {
        req.log.error(`Error en callback OIDC: ${error.message}`);
        const publicUrl = (process.env.APP_PUBLIC_URL || 'http://localhost:3000').replace(/\/$/, '');
        const frontendUrl = `${publicUrl}/login?error=oidc_failed`;
        return reply.redirect(frontendUrl);
    }
}
