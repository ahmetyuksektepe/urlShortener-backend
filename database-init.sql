
-- URLs tablosu
CREATE TABLE IF NOT EXISTS urls (
    id SERIAL PRIMARY KEY,
    short_code VARCHAR(50) UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    custom_alias VARCHAR(50),
    user_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    click_count INTEGER DEFAULT 0
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_urls_short_code ON urls(short_code);
CREATE INDEX IF NOT EXISTS idx_urls_user_id ON urls(user_id);

-- Kullanıcılar tablosu 
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics tablosu 
CREATE TABLE IF NOT EXISTS analytics (
    id SERIAL PRIMARY KEY,
    url_id INTEGER NOT NULL REFERENCES urls(id),
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    referer TEXT,
    country VARCHAR(2),
    city VARCHAR(100)
);

\echo 'Database başlatıldı!' 