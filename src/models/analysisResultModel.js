const db = require('../config/db');

class AnalysisResultModel {
    static async create(skinScanId, acneScore, rednessScore, textureScore, hyperpigmentationScore, overallScore, aiResponse) {
        const query = `
            INSERT INTO analysis_results 
            (skin_scan_id, acne_score, redness_score, texture_score, hyperpigmentation_score, overall_score, ai_response)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [skinScanId, acneScore, rednessScore, textureScore, hyperpigmentationScore, overallScore, aiResponse];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async findByScanId(skinScanId) {
        const query = 'SELECT * FROM analysis_results WHERE skin_scan_id = $1;';
        const result = await db.query(query, [skinScanId]);
        return result.rows[0];
    }

    static async findAllByUserId(userId) {
        const query = `
            SELECT ar.*, ss.image_path, ss.created_at as scan_date
            FROM analysis_results ar
            JOIN skin_scans ss ON ar.skin_scan_id = ss.id
            WHERE ss.user_id = $1
            ORDER BY ss.created_at ASC;
        `;
        const result = await db.query(query, [userId]);
        return result.rows;
    }
}

module.exports = AnalysisResultModel;
