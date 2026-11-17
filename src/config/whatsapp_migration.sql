-- Migration: WhatsApp Checks Table
-- Run this against your skincheck_db PostgreSQL database

CREATE TABLE IF NOT EXISTS whatsapp_checks (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
    phone_input VARCHAR(30)  NOT NULL,
    phone_norm  VARCHAR(20)  NOT NULL,
    status      VARCHAR(30)  NOT NULL,
    message     TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_checks_user_id    ON whatsapp_checks(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_checks_created_at ON whatsapp_checks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_checks_status     ON whatsapp_checks(status);
