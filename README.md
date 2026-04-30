# 💎 Control de Gastos - Sistema Financiero Personal

Una solución moderna, elegante y eficiente para la gestión de finanzas personales. Diseñada con un enfoque **Dark-First**, esta plataforma permite llevar un control riguroso de ingresos, gastos y tarjetas de crédito con una experiencia de usuario fluida y profesional.

---

## ✨ Características Principales

- **📊 Dashboard Interactivo:** Visualización inmediata de KPIs (Balance Neto, Ingresos, Gastos y Ahorros) con filtros temporales.
- **🔐 Autenticación Híbrida:** Soporte para login local y **OIDC (OpenID Connect)** integrado con Pocket ID para una experiencia SSO impecable.
- **💳 Gestión de Tarjetas:** Control de límites de crédito, fechas de corte y ciclos de facturación automáticos.
- **📱 Diseño Ultra-Responsivo:** Experiencia optimizada para escritorio y móviles con componentes adaptativos (FAB en móvil).
- **📂 Categorización Inteligente:** Clasificación personalizada de movimientos con análisis visual de gastos por categoría.
- **🎭 Micro-interacciones Premium:** Animaciones fluidas mediante Framer Motion para una respuesta táctil y visual superior.

---

## 🛠️ Stack Tecnológico

| Componente | Tecnología |
| :--- | :--- |
| **Frontend** | React + Vite + TypeScript |
| **Backend** | Fastify (Node.js) + TypeScript |
| **Base de Datos** | PostgreSQL |
| **Estilos** | Vanilla CSS + CSS Modules |
| **Animaciones** | Framer Motion |
| **Infraestructura** | Docker + Docker Compose |

---

## 🚀 Despliegue Rápido (Docker Compose)

Sigue estos pasos para levantar tu propia instancia en cuestión de segundos:

```bash
# 1. Crear directorio y entrar
mkdir -p control-gastos && cd control-gastos

# 2. Descargar el archivo de orquestación
curl -L https://raw.githubusercontent.com/Groldeath/controlGastos/refs/heads/main/docker/compose/docker-compose.yml -o docker-compose.yml

# 3. Descargar la plantilla de variables
curl -L https://raw.githubusercontent.com/Groldeath/controlGastos/refs/heads/main/docker/compose/.env.example -o .env

# 4. Configurar variables (Edita con tus datos)
# Asegúrate de configurar las credenciales de la base de datos y OIDC
nano .env

# 5. Levantar servicios
docker compose up -d
```

---

## 🏗️ Arquitectura del Proyecto

El proyecto sigue una estructura modular de tres pilares para garantizar la escalabilidad y mantenibilidad:

- `/.ai/`: Inteligencia del proyecto, arquitectura y requerimientos.
- `/src/backend/`: Lógica de servidor, API RESTful y conexión a base de datos.
- `/src/frontend/`: Interfaz de usuario moderna y consumo de APIs.

---

## 📝 Estándares de Desarrollo

- **Commits:** Se sigue el estándar de [Conventional Commits](https://www.conventionalcommits.org/).
- **Idioma:** Todo el código y la documentación están en **Español**.
- **Infraestructura:** Optimizado para despliegue en contenedores sobre **Proxmox LXC**.

---
Desarrollado con ❤️ para una gestión financiera impecable.
