-- Crear la tabla de firmas
CREATE TABLE IF NOT EXISTS signatures (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    signature_image BYTEA NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice para búsquedas por nombre
CREATE INDEX idx_signatures_name ON signatures(name);
