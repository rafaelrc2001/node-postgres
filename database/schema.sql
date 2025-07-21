-- Crear la base de datos si no existe
-- NOTA: Debes crear la base de datos manualmente en PostgreSQL
-- CREATE DATABASE nodepg;

-- Conéctate a la base de datos 'nodepg' y ejecuta lo siguiente:

-- Crear la tabla de usuarios si no existe
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear un trigger para actualizar automáticamente el campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Asignar el trigger a la tabla users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos de ejemplo (opcional)
INSERT INTO users (username, email)
VALUES 
    ('usuario1', 'usuario1@example.com'),
    ('usuario2', 'usuario2@example.com')
ON CONFLICT (email) DO NOTHING;

-- Crear tabla para almacenar firmas
CREATE TABLE IF NOT EXISTS signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    signature_data TEXT NOT NULL, -- Almacenará la firma en base64
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice para búsquedas por nombre
CREATE INDEX IF NOT EXISTS idx_signatures_name ON signatures(name);

-- Crear índice para ordenar por fecha de creación
CREATE INDEX IF NOT EXISTS idx_signatures_created_at ON signatures(created_at);
