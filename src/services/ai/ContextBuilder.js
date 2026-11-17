const db = require('../../config/db');
const AdminModel = require('../../models/adminModel');
const AnalysisResultModel = require('../../models/analysisResultModel');
const SunscreenResultModel = require('../../models/sunscreenResultModel');

class ContextBuilder {
    /**
     * Membangun konteks data untuk AI:
     * - Jika user adalah ADMIN: membaca seluruh metrik, tabel pengguna, scan, sunscreen, dan produk dari database.
     * - Jika user adalah CUSTOMER: membaca profil pribadi, scan wajah terakhir, dan sunscreen check terakhir.
     */
    static async buildContext(user, userMessage = '') {
        if (!user) return '';

        if (user.role === 'ADMIN') {
            return await this.buildAdminContext(user, userMessage);
        }

        return await this.buildCustomerContext(user);
    }

    /**
     * Konteks khusus Admin: data lengkap dari database PostgreSQL
     */
    static async buildAdminContext(user, userMessage = '') {
        let context = `=== STATUS ADMIN SESI ===\n`;
        context += `- Nama Admin: ${user.name} (${user.email})\n`;
        context += `- Role: ADMINISTRATOR\n`;
        context += `- Waktu Akses: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n\n`;

        try {
            // 1. Ringkasan Metrik Dashboard
            const metrics = await AdminModel.getDashboardMetrics();
            let totalProducts = 0;
            let activeProducts = 0;

            try {
                const prodCountRes = await db.query("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'ACTIVE') as active FROM products;");
                totalProducts = parseInt(prodCountRes.rows[0]?.total || 0);
                activeProducts = parseInt(prodCountRes.rows[0]?.active || 0);
            } catch (_) {}

            context += `=== METRIK DATABASE SISTEM SKINCHECK ===\n`;
            context += `- Total Customer Terdaftar: ${metrics.totalUsers} orang (${metrics.activeUsers} aktif, ${metrics.totalUsers - metrics.activeUsers} non-aktif)\n`;
            context += `- Total Face Scans: ${metrics.totalScans} scan (${metrics.scansToday} scan dilakukan hari ini)\n`;
            context += `- Status Analisis Scan: ${metrics.analysisSuccess} berhasil (COMPLETED), ${metrics.analysisFailed} gagal (FAILED)\n`;
            context += `- Total Sunscreen Checks: ${metrics.totalSunscreenChecks} pemeriksaan (${metrics.sunscreenChecksToday} hari ini)\n`;
            context += `- Total Katalog Produk: ${totalProducts} produk (${activeProducts} aktif)\n\n`;

            // 2. Daftar Pengguna (Customer) dari Tabel users - hanya role CUSTOMER, jangan sertakan ADMIN
            const usersRes = await db.query(`
                SELECT id, name, email, role, status, profile_data, created_at 
                FROM users 
                WHERE role = 'CUSTOMER'
                ORDER BY id ASC;
            `);

            context += `=== DAFTAR CUSTOMER TERDAFTAR (DATABASE: users - HANYA CUSTOMER, TANPA ADMIN) ===\n`;
            if (usersRes.rows.length === 0) {
                context += `Tidak ada pengguna di database.\n`;
            } else {
                usersRes.rows.forEach((u, idx) => {
                    const regDate = new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                    let profileInfo = '';
                    if (u.profile_data) {
                        const p = u.profile_data;
                        const goals = Array.isArray(p.skincare_goals) ? p.skincare_goals.join(', ') : (p.skincare_goals || '-');
                        profileInfo = ` | Umur: ${p.age || '-'} | Gender: ${p.gender || '-'} | Tipe Kulit: ${p.skin_type || '-'} | Goals: [${goals}] | Produk Saat Ini: ${p.current_products || '-'}`;
                    }
                    context += `${idx + 1}. [ID: ${u.id}] ${u.name} (Email: ${u.email}) - Role: ${u.role}, Status: ${u.status}, Terdaftar: ${regDate}${profileInfo}\n`;
                });
            }
            context += `\n`;

            // 3. Log 15 Face Scan & Analisis Terbaru dari Tabel skin_scans & analysis_results
            const scansRes = await db.query(`
                SELECT s.id, s.user_id, u.name as user_name, u.email as user_email, s.status, s.created_at,
                       a.overall_score, a.acne_score, a.redness_score, a.texture_score, a.hyperpigmentation_score
                FROM skin_scans s
                LEFT JOIN users u ON s.user_id = u.id
                LEFT JOIN analysis_results a ON a.skin_scan_id = s.id
                ORDER BY s.created_at DESC
                LIMIT 15;
            `);

            context += `=== 15 AKTIVITAS FACE SCAN TERAKHIR (DATABASE: skin_scans & analysis_results) ===\n`;
            if (scansRes.rows.length === 0) {
                context += `Belum ada riwayat face scan di sistem.\n`;
            } else {
                scansRes.rows.forEach((s) => {
                    const scanDate = new Date(s.created_at).toLocaleDateString('id-ID', { 
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                    });
                    const scores = s.overall_score !== null 
                        ? `Skor Visual -> Overall: ${s.overall_score}, Acne/Blemish: ${s.acne_score}, Redness: ${s.redness_score}, Texture: ${s.texture_score}, Hyperpigmentation: ${s.hyperpigmentation_score}`
                        : `Hasil Analisis: Tidak Ada / Belum Selesai`;
                    context += `- Scan #${s.id} | User: ${s.user_name || 'User #' + s.user_id} (${s.user_email || '-'}) | Status: ${s.status} | Waktu: ${scanDate} | ${scores}\n`;
                });
            }
            context += `\n`;

            // 4. Log Pemeriksaan Sunscreen Terbaru dari Tabel sunscreen_results
            const sunRes = await db.query(`
                SELECT sr.id, sr.skin_scan_id, u.name as user_name, sr.coverage_score, sr.coverage_status,
                       sr.low_coverage_areas, sr.analysis_method, sr.hardware_type, sr.created_at
                FROM sunscreen_results sr
                LEFT JOIN skin_scans s ON sr.skin_scan_id = s.id
                LEFT JOIN users u ON s.user_id = u.id
                ORDER BY sr.created_at DESC
                LIMIT 10;
            `);

            context += `=== PEMERIKSAAN SUNSCREEN TERAKHIR (DATABASE: sunscreen_results) ===\n`;
            if (sunRes.rows.length === 0) {
                context += `Belum ada riwayat pemeriksaan sunscreen.\n`;
            } else {
                sunRes.rows.forEach((sr) => {
                    const sunDate = new Date(sr.created_at).toLocaleDateString('id-ID', { 
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                    });
                    const lowAreas = Array.isArray(sr.low_coverage_areas) ? sr.low_coverage_areas.join(', ') : '-';
                    context += `- Check #${sr.id} (Scan #${sr.skin_scan_id}) | User: ${sr.user_name || '-'} | Skor Coverage: ${sr.coverage_score}% | Status: ${sr.coverage_status} | Area Kurang: [${lowAreas}] | Waktu: ${sunDate}\n`;
                });
            }
            context += `\n`;

            // 5. Data Katalog Produk dari Tabel products
            const prodRes = await db.query(`
                SELECT id, brand, name, category, status, skin_concern, usage_guidance, description, ingredients
                FROM products
                ORDER BY brand ASC, name ASC;
            `);

            context += `=== DAFTAR PRODUK KATALOG (DATABASE: products) ===\n`;
            if (prodRes.rows.length === 0) {
                context += `Belum ada produk di database.\n`;
            } else {
                prodRes.rows.forEach((p) => {
                    const concerns = Array.isArray(p.skin_concern) ? p.skin_concern.join(', ') : (p.skin_concern || '-');
                    context += `- Produk #${p.id} [${p.status}]: ${p.brand} - ${p.name} (${p.category}) | Target Masalah: [${concerns}] | Panduan: ${p.usage_guidance || '-'} | Deskripsi: ${p.description || '-'}\n`;
                });
            }

        } catch (err) {
            console.error("[ContextBuilder] Error membaca database untuk admin:", err);
            context += `\nCatatan: Terjadi kendala saat membaca data database: ${err.message}\n`;
        }

        return context;
    }

    /**
     * Konteks khusus Customer: profil pribadi dan scan miliknya
     */
    static async buildCustomerContext(user) {
        let context = `User Profile:\n- Name: ${user.name}\n`;
        
        if (user.profile_data) {
            context += `- Age: ${user.profile_data.age || 'Unknown'}\n`;
            context += `- Skin Type: ${user.profile_data.skin_type || 'Unknown'}\n`;
            context += `- Goals: ${user.profile_data.skincare_goals ? user.profile_data.skincare_goals.join(', ') : 'None'}\n`;
            context += `- Current Products: ${user.profile_data.current_products || 'None'}\n`;
        }

        try {
            // Get latest face scan
            const history = await AnalysisResultModel.findAllByUserId(user.id);
            if (history && history.length > 0) {
                const latest = history[history.length - 1];
                context += `\nLatest Face Scan (Visual Indicators):\n`;
                context += `- Overall Score: ${latest.overall_score}\n`;
                context += `- Acne: ${latest.acne_score}\n`;
                context += `- Redness: ${latest.redness_score}\n`;
                context += `- Texture: ${latest.texture_score}\n`;
                context += `- Hyperpigmentation: ${latest.hyperpigmentation_score}\n`;
            }

            // Get latest sunscreen check
            const sunscreen = await SunscreenResultModel.findLatestByUserId(user.id);
            if (sunscreen) {
                context += `\nLatest Sunscreen Coverage:\n`;
                context += `- Score: ${sunscreen.coverage_score}%\n`;
                context += `- Status: ${sunscreen.coverage_status}\n`;
                if (sunscreen.low_coverage_areas && sunscreen.low_coverage_areas.length > 0) {
                    context += `- Low Coverage Areas: ${sunscreen.low_coverage_areas.join(', ')}\n`;
                }
            }
        } catch (err) {
            console.error("Error building customer context", err);
        }

        return context;
    }
}

module.exports = ContextBuilder;
