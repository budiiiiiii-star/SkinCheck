const db = require('../config/db');

class ScanModel {
    static async create(userId, imagePath, status = 'PENDING', imageQualityScore = 0) {
        const query = `
            INSERT INTO skin_scans (user_id, image_path, status, image_quality_score)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const values = [userId, imagePath, status, imageQualityScore];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async findById(id) {
        const query = 'SELECT * FROM skin_scans WHERE id = $1;';
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    static async findByUserId(userId) {
        const query = 'SELECT * FROM skin_scans WHERE user_id = $1 ORDER BY created_at DESC;';
        const result = await db.query(query, [userId]);
        return result.rows;
    }
}

module.exports = ScanModel;
