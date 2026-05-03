# AGENTS.md — Control de Gastos

## Resumen del proyecto

- **Stack:** Vite + React 19 (TS, ESM) frontend, Fastify (TS, CJS) backend, PostgreSQL
- **Idioma:** Español — código, comentarios, documentación y commits en español
- **Estilos:** Vanilla CSS Modules (`.module.css` junto a cada componente), tema dark-first, animaciones Framer Motion
- **Auth:** Híbrida: JWT local (Bcrypt) + OIDC (Pocket ID vía `openid-client`); tokens en `sessionStorage` con claves `controlGastos_token` y `controlGastos_user`
- **Commits:** Conventional Commits

## Estructura de directorios

```
/
├── .ai/                   # Documentos de arquitectura y requerimientos (fuente de verdad)
├── database/schema.sql    # DDL de PostgreSQL
├── docker/compose/        # Docker Compose (prod) + .env.example
├── src/
│   ├── backend/           # Servidor Fastify (CJS)
│   └── frontend/          # SPA Vite (ESM)
└── .env                   # Archivo de entorno compartido en la raíz (cargado por ambos paquetes)
```

Ambos paquetes son **independientes** — no hay tooling de monorepo ni `package.json` en la raíz. Los comandos `npm` se ejecutan dentro de `src/backend/` o `src/frontend/`.

## Comandos de desarrollo

```bash
# Backend (ejecutar desde src/backend/)
npm run dev          # tsc-watch → recompila y reinicia automáticamente al detectar cambios
npm run build        # tsc → dist/
npm start            # node dist/server.js

# Frontend (ejecutar desde src/frontend/)
npm run dev          # Servidor Vite (puerto 5173, proxy /api → localhost:3000)
npm run build        # tsc -b && vite build
npm run lint         # ESLint (configuración flat)
npm run preview      # Vite preview del build de producción
```

## Entorno y configuración

- **`.env` raíz** es la fuente única; copiar desde `docker/compose/.env.example` para desarrollo local.
- El backend carga `.env` relativo a su **salida compilada** (`dist/`), por eso la ruta en código fuente es `../../../.env`. Los scripts `.js` sueltos en `src/backend/` (`alter_db.js`, `fix_db.js`, `ensure_fkeys.js`) resuelven `.env` cada uno con rutas relativas distintas — son scripts de mantenimiento de BD, no forman parte de la app.
- Vite en frontend usa `envDir: '../../'` para cargar el `.env` raíz.
- El secreto JWT por defecto es `secreto_desarrollo_local_123` (solo desarrollo).
- Las variables OIDC son opcionales — dejarlas vacías para deshabilitar OIDC en desarrollo.

## Notas de arquitectura

- **La BD es externa** — no está incluida en Docker Compose. PostgreSQL corre por separado (Proxmox LXC). El esquema está en `database/schema.sql`.
- Patrón del backend: `routes/` → `controllers/` → `db/index.ts` (`pg` Pool directo, sin ORM).
- El backend usa sintaxis ES `import` en el código fuente pero `type: "commonjs"` en `package.json` — TypeScript compila a CJS.
- Ruteo del frontend: rutas públicas (`/login`, `/auth/callback`) fuera de `<GlobalLayout>`, rutas privadas (`/dashboard`, `/budgets`, `/movements`, `/users`) dentro de él.
- `AppContext.tsx` maneja el filtro global de fecha (mes/año) y estado de modales; `AuthContext.tsx` maneja sesión y redirecciones.
- Cada componente de React tiene su archivo `.module.css` co-ubicado.
- El `tsconfig` del frontend exige `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, `verbatimModuleSyntax`.
- El proxy `/api/` solo funciona en Vite dev. En producción, Nginx en el contenedor frontend proxyfica `/api/` hacia `http://cg_backend:3000/api/`.

## CI/CD

- `.github/workflows/deploy.yaml` construye y publica imágenes Docker en GHCR al hacer push a `main`.
- Imagen backend: `ghcr.io/<actor>/control-gastos-backend:latest`
- Imagen frontend: `ghcr.io/<actor>/control-gastos-frontend:latest`
- Builds Docker multi-etapa: Node Alpine para compilación, Alpine/Nginx para runtime.

## Convenciones

- No hay tests configurados todavía (`test` es un placeholder en ambos paquetes).
- `.vscode/` e `.idea/` están en `.gitignore` — no hay configuración de editor compartida.
- Usar `sessionStorage.setItem('controlGastos_token', ...)` para auth — no `localStorage`.
