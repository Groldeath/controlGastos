# Requerimientos del Proyecto - Control de Gastos

Este documento detalla los requerimientos funcionales y no funcionales para la aplicación de Control de Gastos.

## 1. Visión General
Una herramienta para que los usuarios puedan registrar sus ingresos y gastos diarios, categorizarlos y visualizar reportes básicos para el manejo de sus finanzas personales.

## 2. Requerimientos Funcionales

### R0. Configuración Inicial (First Run)
- **RU0.1: Detección de Sistema Vacío:** El sistema debe detectar si no existen usuarios registrados al iniciar.
- **RU0.2: Registro de Administrador:** En el primer arranque, se debe mostrar un formulario exclusivo para crear el primer usuario con privilegios de Administrador.

### R1. Control de Acceso y Usuarios
- **RU1.1:** El sistema debe contar con un proceso de autenticación seguro (Híbrido).
- **RU1.2: Autenticación OIDC:** Soporte para Single Sign-On mediante proveedores externos (ej. Pocket ID).
- **RU1.3: Vinculación de Cuentas:** Capacidad de enlazar sesiones OIDC con correos electrónicos ya registrados en el sistema.
- **RU1.4: Auto-Provisioning:** Creación automática de cuentas para nuevos usuarios autenticados vía OIDC, asignando el rol de `usuario` por defecto y capturando el nombre desde los claims del proveedor (`given_name`, `name`, etc.).
- **RU1.5:** Gestión de usuarios por parte del Administrador.
- **RU1.6:** Sesiones persistentes seguras (JWT).
- **RU1.7: Aislamiento de Datos:** Cada usuario solo tendrá acceso a sus propios movimientos, categorías y tarjetas. Los datos están estrictamente vinculados al ID del usuario.

### R2. Gestión de Gastos e Ingresos (Movimientos)
- **RU2.1:** Registro de transacciones (monto, descripción, fecha, categoría).
- **RU2.2:** Diferenciación clara entre "Gasto" e "Ingreso".
- **RU2.3:** Edición y eliminación de registros existentes.
- **RU2.4: Listado Paginado:** Los movimientos deben visualizarse en una tabla o lista con paginación para optimizar el rendimiento y la experiencia del usuario.
- **RU2.5: Gastos Directos vs Tarjeta:** Capacidad de identificar si un gasto fue pagado en efectivo/débito o con tarjeta de crédito.

### R3. Gestión de Tarjetas de Crédito
- **RU3.1: Configuración de Tarjetas:** Registro de tarjetas con nombre, límite de crédito y fecha de corte.
- **RU3.2: Ciclos de Facturación:** El sistema debe agrupar los gastos de la tarjeta según su fecha de corte para mostrar el saldo a pagar en el periodo actual.
- **RU3.3: Recordatorios:** Visualización de fechas próximas de corte y pago.

### R3. Categorización
- **RU3.1:** El usuario debe poder asignar categorías a cada gasto (ej: Alimentación, Transporte, Entretenimiento).
- **RU3.2:** Capacidad de añadir categorías personalizadas.

### R4. Reportes y Visualización (Dashboard)
- **RU4.1: Resumen de KPIs (Widgets):**
    - **Balance Neto:** Cálculo de ingresos totales menos gastos con indicador de estado (Superávit/Déficit).
    - **Total Gastado:** Sumatoria de gastos del mes seleccionado.
    - **Ingresos Totales:** Sumatoria de ingresos del mes seleccionado.
    - **Ahorros Totales:** Visualización del ahorro acumulado histórico.
- **RU4.2: Análisis de Gastos:** Lista scrollable de gastos agrupados por categoría con sus respectivos montos, ordenado de la categoria con mayor gasto a la menor.
- **RU4.3: Control de Tarjetas:** Widget de "Próximos Pagos Pendientes" que muestre el saldo acumulado de las tarjetas según su ciclo de facturación.
- **RU4.4: Filtros Temporales:** Selector de Mes/Año para consultar datos históricos.
- **RU4.5: Acciones Rápidas:** Botón prominente "+" para agregar movimientos desde cualquier parte del Dashboard.

### R4. Gestión de Cuenta y Sesión
- **RU4.1: Perfil de Usuario:** Opción "Cuenta" para que el usuario modifique su nombre o contraseña.
- **RU4.2: Cierre de Sesión Seguro:** Al cerrar sesión, se debe eliminar cualquier rastro (JWT, caché, localStorage) para garantizar la seguridad.
- **RU4.3: Roles:** Visualización clara de si el usuario es "Administrador" o "Usuario" en su perfil/interfaz.

### R5. Gestión de Categorías y Tarjetas (Vistas Rápidas)
- **RU5.1: Interacción Ligera:** Dado que los formularios de gestión de categorías y tarjetas son compactos, se mostrarán en ventanas emergentes (modales) o paneles hover sin necesidad de navegar a una nueva página.
- **RU5.2: CRUD en Modal:** El usuario podrá añadir, editar y eliminar categorías o tarjetas directamente desde estas ventanas.

## 3. Requerimientos No Funcionales

### RN1. Interfaz de Usuario (UI/UX)
- **RN1.1: Diseño Responsivo:** Optimizado mediante Media Queries para móviles.
- **RN1.2: Enfoque "Dark-First":** Modo oscuro principal con opción de modo claro.
- **RN1.3: Header Global Persistente:**
    - **Control de Sidebar:** Botón para expandir/colapsar la navegación lateral.
    - **Selector de Periodo:** Control de Mes/Año que actúa como filtro global para la vista actual (Dashboard o Movimientos).
    - **Acción Rápida:** 
        - Botón "+ Agregar" en el Header para versiones de escritorio.
        - **FAB (Floating Action Button):** En versiones móviles, el botón se transforma en un círculo flotante fijo en la esquina inferior derecha para un acceso ergonómico y rápido.
- **RN1.4: Navegación Lateral (Sidebar):**
    - **Cuerpo:** Dashboard, Movimientos (Página), Categorías (Modal), Tarjetas (Modal).
    - **Sección Admin:** Administrar Usuarios.
    - **Footer (Perfil):** Nombre, Rol y menú de opciones (Cuenta/Cerrar Sesión).
- **RN1.5: Estética Premium:** Interfaz limpia con micro-animaciones y sombras suaves.

### RN2. Backend y Base de Datos
- **RN2.1: PostgreSQL:** Uso obligatorio de PostgreSQL para la persistencia de datos.

### RN3. Infraestructura y Despliegue
- **RN3.1: Contenerización:** Despliegue mediante Docker sobre Proxmox LXC.
- **RN3.2: Eficiencia:** Uso de imágenes Alpine o Slim para optimizar recursos.
- **RN3.3: Gitea:** Gestión de código y paquetes a través de Gitea.

---
**Estado:** Requerimientos Ejecutados e Implementados Exitosamente (V1). Todos los submódulos de UI, UX interactivos (in-line actions), Backend con Auth, y orquestación base con `.docker-compose.yml` cubiertos.
**Última Actualización:** 2026-03-09
