# Especificación Técnica: Módulo de Presupuestos (Versión Independiente)

Este documento describe la especificación técnica para la implementación del **Módulo de Presupuestos**. A diferencia de una estructura rígida por categorías, este módulo permite crear presupuestos como entes independientes que pueden agrupar gastos de diversas categorías mediante asignación manual.

## 1. Visión General
Los presupuestos actúan como "bolsas de dinero" temporales (mensuales) con un nombre y un límite definido. El usuario vincula un gasto a un presupuesto de forma explícita al momento de registrar el movimiento.

## 2. Objetivos
- Permitir la creación de presupuestos con nombres personalizados (ej. "Citas", "Vacaciones", "Mantenimiento Casa").
- Proporcionar flexibilidad para que un gasto (sin importar su categoría) pueda ser descontado de un presupuesto específico.
- Visualizar el progreso de consumo de cada presupuesto en tiempo real.
- Mantener la independencia total entre la clasificación por categorías (qué se compró) y el control de presupuestos (objetivo del gasto).

## 3. Estructura de Datos
La persistencia de este módulo se gestiona mediante la tabla `presupuestos` y una relación en la tabla `transacciones`. (Ver detalles técnicos en `database/schema.sql`).

### 3.1. Campos de la Tabla `presupuestos`
- `id`: Identificador único (Serial).
- `usuario_id`: Relación con el usuario propietario.
- `nombre`: Nombre descriptivo del presupuesto.
- `monto_limite`: Cantidad máxima asignada.
- `mes` / `anio`: Periodo de vigencia.
- `color_hex`: Color para representación visual en la UI.

### 3.2. Relación en `transacciones`
- `presupuesto_id`: Referencia opcional (FK) que vincula un movimiento a un presupuesto específico.

## 4. Requerimientos Funcionales

### R1. Gestión de Presupuestos
- **RU1.1:** El usuario puede crear múltiples presupuestos para un mes/año específico.
- **RU1.2:** Cada presupuesto debe tener un nombre, un monto límite y un mes/año de vigencia.
- **RU1.3:** Los presupuestos son específicos por usuario.
- **RU1.4:** CRUD completo (Crear, Leer, Actualizar, Eliminar) para los presupuestos.

### R2. Vinculación de Movimientos
- **RU2.1:** El formulario de "Nuevo Movimiento" y "Editar Movimiento" debe incluir un selector (Dropdown) de presupuestos.
- **RU2.2:** El selector solo mostrará los presupuestos activos para el mes/año de la fecha del movimiento.
- **RU2.3:** La vinculación es opcional. Un gasto puede no pertenecer a ningún presupuesto.
- **RU2.4:** Si se cambia la fecha de un movimiento a un mes distinto, la vinculación al presupuesto debe validarse o resetearse si el presupuesto no existe en el nuevo periodo.

### R3. Lógica de Consumo
- **RU3.1:** El gasto actual de un presupuesto es la sumatoria de todos los movimientos de tipo "Gasto" vinculados a su `id`.
- **RU3.2:** El sistema debe calcular el porcentaje de ejecución: `(total_gastado / monto_limite) * 100`.

## 5. Interfaz de Usuario (UI/UX)

### NU1. Dashboard - Widgets y Secciones
- **Nuevo Widget: "Balance Neto":**
    - **Cálculo:** `Ingresos del Mes - Suma de Límites de Presupuestos - Gastos sin Presupuesto`.
    - **Propósito:** Mostrar al usuario cuánto dinero tiene realmente disponible para gastar fuera de lo que ya ha "apartado" mentalmente en sus presupuestos.
- **Sección de Presupuestos:**
    - **Posición:** Debajo de los widgets de balance y arriba del desglose por categorías.
    - **Visualización:** Tarjetas o lista con barras de progreso horizontales.
    - **Estados Visuales (Colores):**
        - **Azul/Verde:** < 75% del límite.
        - **Amarillo/Naranja:** 75% - 90% (Advertencia).
        - **Rojo:** > 90% (Cerca del límite o excedido).
    - **Interacción:** Click en un presupuesto para ver el listado de movimientos asociados a él.

### NU2. Navegación y Vista de Gestión
- **Ubicación en Sidebar:** Categoría "Principal", posicionado entre **Dashboard** y **Movimientos**.
- **Icono:** `PiggyBank` o `Wallet` (Lucide-react).
- **Funcionalidad:** Vista dedicada para ver el listado de presupuestos del mes, crear nuevos, editar montos/nombres y eliminar.
- **Acción Especial:** Opción de "Clonar" presupuestos del mes anterior para facilitar la configuración recurrente.

### NU3. Formulario de Movimientos
- Añadir el campo "Presupuesto" entre "Categoría" y "Tarjeta de Crédito".
- El campo debe ser una búsqueda/selección rápida.

## 6. API Endpoints (Backend)

- `GET /api/presupuestos`: Listar presupuestos del mes (filtrado por `mes` y `anio` desde el query).
- `POST /api/presupuestos`: Crear nuevo presupuesto.
- `PUT /api/presupuestos/:id`: Actualizar monto o nombre.
- `DELETE /api/presupuestos/:id`: Eliminar presupuesto.
- `GET /api/presupuestos/:id/movimientos`: Obtener todos los movimientos asociados a un presupuesto específico.

## 7. Plan de Implementación
1. **Fase 1 (DB):** Ejecutar scripts de migración para crear la tabla y añadir la columna en `transacciones`.
2. **Fase 2 (Backend):** Implementar controladores y rutas para el CRUD de presupuestos y actualizar la lógica de transacciones para manejar el `presupuesto_id`.
3. **Fase 3 (Frontend - Forms):** Actualizar el modal de movimientos para incluir el selector de presupuestos.
4. **Fase 4 (Frontend - Dashboard):** Crear el componente de visualización de presupuestos.
5. **Fase 5 (Frontend - Admin):** Crear la interfaz de gestión de presupuestos.
