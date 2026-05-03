# Arquitectura del Proyecto - Control de Gastos

Este documento describe la arquitectura técnica y estructural de la aplicación, siguiendo la jerarquía obligatoria de los tres pilares.

## 1. Estructura del Proyecto (Estructura de Pilares)

```text
/
├── .ai/          # Inteligencia del proyecto (Arquitectura y Requerimientos)
├── src/backend/      # Lógica de servidor y conexión a base de datos
└── src/frontend/     # Interfaz de usuario y consumo de APIs
```

## 2. Stack Tecnológico

### Frontend
- **Framework:** Vite + React (TypeScript).
- **Componentes Core:**
    - **Header Global:** 
        - Toggle de Sidebar.
        - Selector de Fecha (Estado global: Mes/Año).
        - Botón "Agregar Movimiento" (Escritorio).
    - **Acción Móvil:**
        - **FAB (Floating Action Button):** Botón circular flotante persistente para "Agregar Movimiento".
    - **Sidebar:** 
        - Navegación: Dashboard, Presupuestos (Página), Movimientos (Página), Categorías (Modal), Tarjetas (Modal).
        - Gestión de Usuarios (Admin only - Integrada funcionalmente in-line y en modales).
        - Toggle de Tema (Claro/Oscuro).
        - Perfil de usuario con menú de opciones.
    - **Página de Presupuestos:** Gestión CRUD completa con tarjetas interactivas, barras de progreso, modal de movimientos asociados, y clonación desde el mes anterior.
    - **Página de Movimientos:** Tabla/Lista con soporte para paginación desde el servidor y columna de Presupuesto.
    - **Dashboard:**
        - Grid de Widgets de resumen (KPI Cards).
        - Sección de Presupuestos con barras de progreso (consumo vs límite) con estados visuales por color.
        - Lista de Categorías (Orden descendente por gasto).
        - Panel de Pagos de Tarjetas (Ciclos de Corte).
        - Tabla de últimos movimientos con columna de Presupuesto.
    - **Modales/Vistas Hover:**
        - Gestión de Categorías (CRUD rápido).
        - Gestión de Tarjetas (Configuración de corte/límite).
        - "Agregar Movimiento" (Formulario unificado con selector de Presupuesto).
    - **Header:** Selector de fecha y Conmutador de Tema.
- **Estilos:** Vanilla CSS (CSS Modules) con variables CSS y Media Queries avanzados. Hover state support en listas y grillas para respuesta interactiva.
- **Animaciones:** Framer Motion para micro-interacciones premium (E.g. Confirmaciones de borrado In-Line mediante checkmark verde o tache roja).

### Backend
- **Framework:** Fastify (Node.js + TypeScript).
- **Base de Datos:** PostgreSQL (Relacional).
- **Seguridad:** 
    - **Híbrida:** Autenticación local (JWT + Argon2/Bcrypt) y **OIDC (OpenID Connect)** para integración con proveedores como Pocket ID.
    - **Librería:** `openid-client` para la gestión de flujos SSO.
- **API:** RESTful con documentación automática de esquemas.
    - `/api/auth` — Autenticación y registro.
    - `/api/users` — Gestión de usuarios (admin).
    - `/api/categories` — CRUD de categorías.
    - `/api/credit-cards` — CRUD de tarjetas de crédito.
    - `/api/transactions` — CRUD de movimientos, resumen (dashboard) y meses activos.
    - `/api/presupuestos` — CRUD de presupuestos y consulta de movimientos vinculados.

### Infraestructura
- **Orquestación:** Docker Compose para la gestión de servicios (`frontend` y `backend`).
- **Base de Datos:** Externa (Ejecutada en un Proxmox LXC independiente).
- **Contenedores:** 
    - `backend-service`: Fastify Node.js (Alpine) multi-stage dockerfile.
    - `frontend-service`: Servidor SPA Nginx Alpine inmutable (con conf por defecto de React Router).
- **Configuración:** Uso obligatorio de `.env.example` para gestionar credenciales locales y secretos OIDC (Issuer, Client ID, Secret).

## 3. Modelo de Datos
- **Usuarios:** ID, NombreUsuario, Email, HashContraseña, oidc_id (unique, null if local), Rol (admin/usuario), FechaCreacion.
- **Transacciones:** ID, UsuarioID, Tipo (ingreso/gasto/ahorro), Monto, CategoriaID, TarjetaCreditoID, PresupuestoID, Descripcion, Fecha.
- **Presupuestos:** ID, UsuarioID, Nombre, MontoLimite, Mes, Anio, ColorHex, FechaCreacion.
    - Los presupuestos son entes independientes con vigencia mensual. Un gasto se vincula manualmente a un presupuesto mediante `PresupuestoID`.

## 4. Estándares de Desarrollo
- **Commits:** Seguir estrictamente el estándar de *Conventional Commits*.
- **Código:** Modular, limpio y documentado en español.
- **Idioma del Proyecto:** Comunicación y comentarios en español.

---
**Estado:** V1.2 Módulo de Presupuestos implementado.
**Última Actualización:** 2026-05-03
