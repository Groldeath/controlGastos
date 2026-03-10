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
3. Edita `.env` agregando los valores correspondientes para conectarte a la base de datos. Ejemplo:
   ```env
   DATABASE_URL="postgres://usuario:contraseña@ip-de-tu-db:5432/controlGastos"
   JWT_SECRET="un_secreto_super_seguro_con_suficiente_longitud"
   PORT=3000
   ```
   *(También asegúrate de que el frontend tenga `VITE_API_URL=/api` en su entorno)*
   
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

## 🛠 Estructura de Proyecto bajo Pilares

El proyecto está diseñado de forma modular bajo **3 pilares inmutables**:

- **`.ai/`**: Cerebro e inteligencia base (Aquí residen arquitectura.md y requerimientos.md para consultar todas las reglas del negocio).
- **`backend/`**: Rutas y lógica API alojada en Fastify + TypeScript (Puerto 3000).
- **`frontend/`**: Auténtica app tipo SPA alimentada con Vite + React alojada y renderizada individualmente.

> Al diseñar nuevas abstracciones y dependencias, respeta el nivel de aislamiento de los pilares consultando siempre el material de `.ai/`.
