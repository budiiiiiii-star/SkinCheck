const db = require('../config/db');

class AdminModel {
    static async getDashboardMetrics() {
        const metrics = {
            totalUsers: 0,
            activeUsers: 0,
            totalScans: 0,
            scansToday: 0,
            totalSunscreenChecks: 0,
            sunscreenChecksToday: 0,
            analysisSuccess: 0,
            analysisFailed: 0
        };

        try {
            // Users
            let res = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'CUSTOMER'");
            metrics.totalUsers = parseInt(res.rows[0].count);

            res = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'CUSTOMER' AND status = 'ACTIVE'");
            metrics.activeUsers = parseInt(res.rows[0].count);

            // Scans
            res = await db.query("SELECT COUNT(*) as count FROM skin_scans");
            metrics.totalScans = parseInt(res.rows[0].count);

            res = await db.query("SELECT COUNT(*) as count FROM skin_scans WHERE DATE(created_at) = CURRENT_DATE");
            metrics.scansToday = parseInt(res.rows[0].count);

            res = await db.query("SELECT COUNT(*) as count FROM skin_scans WHERE status = 'COMPLETED'");
            metrics.analysisSuccess = parseInt(res.rows[0].count);

            res = await db.query("SELECT COUNT(*) as count FROM skin_scans WHERE status = 'FAILED'");
            metrics.analysisFailed = parseInt(res.rows[0].count);

            // Sunscreen Checks
            res = await db.query("SELECT COUNT(*) as count FROM sunscreen_results");
            metrics.totalSunscreenChecks = parseInt(res.rows[0].count);

            res = await db.query("SELECT COUNT(*) as count FROM sunscreen_results WHERE DATE(created_at) = CURRENT_DATE");
            metrics.sunscreenChecksToday = parseInt(res.rows[0].count);

        } catch (err) {
            console.error("Error fetching metrics", err);
        }

        return metrics;
    }

    static async getAllUsers() {
        const query = "SELECT id, name, email, role, status, created_at FROM users WHERE role = 'CUSTOMER' ORDER BY created_at DESC;";
        const result = await db.query(query);
        return result.rows;
    }

    static async toggleUserStatus(userId, newStatus) {
        const query = "UPDATE users SET status = $1 WHERE id = $2 RETURNING *;";
        const result = await db.query(query, [newStatus, userId]);
        return result.rows[0];
    }
}

module.exports = AdminModel;
