# Control de Gastos - Sistema Financiero Personal

Una solución web completa para el seguimiento y control de tus finanzas personales y tarjetas de crédito, lista para ser desplegada en entornos self-hosted y contenedores LXC en Proxmox.

---

## 🚀 Despliegue Rápido (Docker Compose)

Este proyecto está diseñado para desplegarse fácilmente gracias a sus imágenes ligeras basadas en Alpine. En la raíz del proyecto encontrarás el archivo `docker-compose.yml`.

### Requisitos Previos

- Docker instalado.
- Docker Compose.
- Base de datos PostgreSQL externa (Asegúrate de preparar tu Proxmox LXC de Postgres o un contenedor de Base de datos, nosotros recomendamos aislar la base de datos de la lógica del servidor).

### Pasos de Despliegue

1. **Clonar este repositorio** y entrar en la carpeta principal.
2. Hacer un archivo `.env` configurando las variables necesarias. Copia la base desde el archivo `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Edita `.env` agregando los valores correspondientes para conectarte a la base de datos y configurar la autenticación. 

   #### Configuración OIDC (Pocket ID) - Opcional
   Para habilitar Single Sign-On (SSO) con Pocket ID, añade las siguientes variables:
   - `OIDC_ISSUER_URL`: URL de tu instancia de Pocket ID.
   - `OIDC_CLIENT_ID` y `OIDC_CLIENT_SECRET`: Generados en tu panel de Pocket ID.
   - `APP_PUBLIC_URL`: La URL pública donde se aloja esta aplicación (ej. `https://gastos.tu-dominio.com`).

4. **Construir y levantar** la infraestructura:
   ```bash
   docker-compose up -d --build
   ```

### Estructura del `docker-compose.yml`

El archivo de orquestación levantará dos servicios intercomunicados pero aislados bajo una única red de Bridge:

1. **`backend-service` (Puerto 3000)**: Imagen ultraligera de Node.js (Alpine) corriendo Fastify. Recursos sumamente limitados (256MB Ram / 0.5 CPU) ideal para micro-LXCs.
2. **`frontend-service` (Puerto 80)**: Un servidor web Nginx puro e inmutable con el Build de React. Servirá los Assets estáticos sin saturar las solicitudes de tu API con un ruteo SPA (Single Page Application) en la raíz `/`.

Ambos heredan tus configuraciones desde el `.env` central ubicado en la misma carpeta.

---

## 🔒 Autenticación Híbrida (OIDC + Local)

El sistema soporta un esquema de autenticación flexible:
- **Login Local:** Basado en correo y contraseña con hash Argon2/Bcrypt.
- **SSO con Pocket ID:** Integración nativa vía OpenID Connect.
- **Account Linking:** Si inicias sesión vía SSO con un correo que ya existe en la base de datos local, el sistema vinculará ambas cuentas automáticamente sin pérdida de datos.
- **Auto-Provisioning:** Los nuevos usuarios autenticados vía SSO que no existan en la base de datos serán creados automáticamente con el rol de `usuario`.

---

## 🛠 Estructura de Proyecto bajo Pilares

El proyecto está diseñado de forma modular bajo **3 pilares inmutables**:

- **`.ai/`**: Cerebro e inteligencia base (Aquí residen arquitectura.md y requerimientos.md para consultar todas las reglas del negocio).
- **`backend/`**: Rutas y lógica API alojada en Fastify + TypeScript (Puerto 3000).
- **`frontend/`**: Auténtica app tipo SPA alimentada con Vite + React alojada y renderizada individualmente.

> Al diseñar nuevas abstracciones y dependencias, respeta el nivel de aislamiento de los pilares consultando siempre el material de `.ai/`.
