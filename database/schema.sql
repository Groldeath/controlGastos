-- Archivo DDL Final - schema.sql
-- Ejecutar este archivo en la base de datos PostgreSQL del entorno LXC

-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hash_contrasena TEXT NOT NULL,
    oidc_id TEXT UNIQUE, -- ID devuelto por el proveedor OIDC (Pocket ID)
    rol VARCHAR(20) DEFAULT 'usuario' CHECK (rol IN ('admin', 'usuario')),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Categorías (Vinculada a cada usuario)
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre VARCHAR(50) NOT NULL
);

-- 3. Tabla de Tarjetas de Crédito
CREATE TABLE IF NOT EXISTS tarjetas_credito (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    dia_corte INTEGER NOT NULL CHECK (dia_corte BETWEEN 1 AND 31),
    dia_pago INTEGER NOT NULL CHECK (dia_pago BETWEEN 1 AND 31), -- Día del mes de pago
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Transacciones
CREATE TABLE IF NOT EXISTS transacciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ingreso', 'gasto', 'ahorro')),
    monto DECIMAL(12, 2) NOT NULL,
    categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
    tarjeta_credito_id INTEGER REFERENCES tarjetas_credito(id) ON DELETE SET NULL,
    descripcion TEXT,
    fecha DATE NOT NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices para optimización de consultas comunes
CREATE INDEX IF NOT EXISTS idx_transacciones_usuario_fecha ON transacciones(usuario_id, fecha);
CREATE INDEX IF NOT EXISTS idx_transacciones_usuario_tipo ON transacciones(usuario_id, tipo);
CREATE INDEX IF NOT EXISTS idx_categorias_usuario ON categorias(usuario_id);
CREATE INDEX IF NOT EXISTS idx_tarjetas_usuario ON tarjetas_credito(usuario_id);

