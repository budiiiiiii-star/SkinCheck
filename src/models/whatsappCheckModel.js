/**
 * whatsappCheckModel.js
 * Model untuk menyimpan riwayat pengecekan WhatsApp ke PostgreSQL.
 */
const db = require('../config/db');

const WhatsAppCheckModel = {
    /**
     * Inisialisasi tabel jika belum ada
     */
    async createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS whatsapp_checks (
                id          SERIAL PRIMARY KEY,
                user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
                phone_input VARCHAR(30)  NOT NULL,
                phone_norm  VARCHAR(20)  NOT NULL,
                status      VARCHAR(30)  NOT NULL,
                message     TEXT,
                created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_whatsapp_checks_user_id ON whatsapp_checks(user_id);
            CREATE INDEX IF NOT EXISTS idx_whatsapp_checks_created_at ON whatsapp_checks(created_at DESC);
        `;
        await db.query(sql);
    },

    /**
     * Simpan hasil pengecekan
     */
    async create({ userId, phoneInput, phoneNorm, status, message }) {
        const result = await db.query(
            `INSERT INTO whatsapp_checks (user_id, phone_input, phone_norm, status, message)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [userId || null, phoneInput, phoneNorm, status, message]
        );
        return result.rows[0];
    },

    /**
     * Ambil riwayat dengan filter, search, dan pagination
     */
    async findAll({ userId, status, search, page = 1, limit = 20 } = {}) {
        const offset = (page - 1) * limit;
        const conditions = [];
        const params = [];
        let idx = 1;

        if (userId) { conditions.push(`user_id = $${idx++}`); params.push(userId); }
        if (status && status !== 'all') { conditions.push(`status = $${idx++}`); params.push(status); }
        if (search) { conditions.push(`(phone_input ILIKE $${idx} OR phone_norm ILIKE $${idx})`); params.push(`%${search}%`); idx++; }

        const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
        const countResult = await db.query(`SELECT COUNT(*) FROM whatsapp_checks ${where}`, params);
        const total = parseInt(countResult.rows[0].count, 10);

        params.push(limit, offset);
        const dataResult = await db.query(
            `SELECT id, phone_input, phone_norm, status, message, created_at
             FROM whatsapp_checks ${where}
             ORDER BY created_at DESC
             LIMIT $${idx++} OFFSET $${idx++}`,
            params
        );

        return { data: dataResult.rows, total, page, limit, totalPages: Math.ceil(total / limit) };
    },

    /**
     * Statistik untuk dashboard
     */
    async getStats(userId = null) {
        const userFilter = userId ? `WHERE user_id = $1` : '';
        const params = userId ? [userId] : [];
        const result = await db.query(
            `SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status = 'registered')          AS registered,
                COUNT(*) FILTER (WHERE status = 'not_registered')      AS not_registered,
                COUNT(*) FILTER (WHERE status = 'verification_failed') AS failed,
                COUNT(*) FILTER (WHERE status = 'invalid_number')      AS invalid,
                COUNT(*) FILTER (WHERE status = 'unknown')             AS unknown
             FROM whatsapp_checks ${userFilter}`,
            params
        );
        return result.rows[0];
    },
};

module.exports = WhatsAppCheckModel;
