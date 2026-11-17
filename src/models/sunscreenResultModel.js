const db = require('../config/db');

class SunscreenResultModel {
    static async create(skinScanId, coverageScore, coverageStatus, heatmapPath, lowCoverageAreas, analysisMethod = 'VISUAL_ESTIMATION', hardwareType = 'RGB_CAMERA') {
        const query = `
            INSERT INTO sunscreen_results 
            (skin_scan_id, coverage_score, coverage_status, heatmap_path, low_coverage_areas, analysis_method, hardware_type)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [skinScanId, coverageScore, coverageStatus, heatmapPath, JSON.stringify(lowCoverageAreas), analysisMethod, hardwareType];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async findByScanId(skinScanId) {
        const query = 'SELECT * FROM sunscreen_results WHERE skin_scan_id = $1;';
        const result = await db.query(query, [skinScanId]);
        return result.rows[0];
    }

    static async findLatestByUserId(userId) {
        const query = `
            SELECT sr.*, ss.image_path, ss.created_at as scan_date
            FROM sunscreen_results sr
            JOIN skin_scans ss ON sr.skin_scan_id = ss.id
            WHERE ss.user_id = $1
            ORDER BY ss.created_at DESC
            LIMIT 1;
        `;
        const result = await db.query(query, [userId]);
        return result.rows[0];
    }
}

module.exports = SunscreenResultModel;
