const db = require('../config/db');

class NotificationModel {
    static async initTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS admin_notifications (
                id SERIAL PRIMARY KEY,
                type VARCHAR(50) DEFAULT 'NEW_USER',
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                data JSONB,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        try {
            await db.query(query);
        } catch (err) {
            console.warn('[NotificationModel] Failed to init table:', err.message);
        }
    }

    static async create({ type = 'NEW_USER', title, message, data = {} }) {
        await this.initTable();
        const query = `
            INSERT INTO admin_notifications (type, title, message, data)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const result = await db.query(query, [type, title, message, JSON.stringify(data)]);
        return result.rows[0];
    }

    static async getRecent(limit = 10) {
        await this.initTable();
        const query = `
            SELECT * FROM admin_notifications
            ORDER BY created_at DESC
            LIMIT $1;
        `;
        const result = await db.query(query, [limit]);
        return result.rows;
    }

    static async getUnreadCount() {
        await this.initTable();
        const query = `
            SELECT COUNT(*) as count 
            FROM admin_notifications 
            WHERE is_read = FALSE;
        `;
        const result = await db.query(query);
        return parseInt(result.rows[0]?.count || 0);
    }

    static async markAsRead(id) {
        await this.initTable();
        const query = `
            UPDATE admin_notifications
            SET is_read = TRUE
            WHERE id = $1
            RETURNING *;
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    static async markAllAsRead() {
        await this.initTable();
        const query = `
            UPDATE admin_notifications
            SET is_read = TRUE
            WHERE is_read = FALSE;
        `;
        await db.query(query);
        return true;
    }
}

// Inisialisasi awal saat load
NotificationModel.initTable().catch(() => {});

module.exports = NotificationModel;

