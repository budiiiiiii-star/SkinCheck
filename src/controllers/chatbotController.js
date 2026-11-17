const NvidiaLLMProvider = require('../services/ai/NvidiaLLMProvider');
const SafetyLayer = require('../services/ai/SafetyLayer');
const ContextBuilder = require('../services/ai/ContextBuilder');
const RecommendationService = require('../services/ai/RecommendationService');

/**
 * Chatbot Widget Stream Endpoint
 * Streaming endpoint khusus untuk widget chatbot floating di Beranda/Dashboard.
 * - Untuk ADMIN: membaca seluruh metrik, tabel users, skin_scans, sunscreen_results, dan products dari database.
 * - Untuk CUSTOMER: membaca profil user, riwayat scan pribadi, dan rekomendasi produk.
 */
const chatbot_stream_post = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ success: false, message: 'Pesan kosong.' });
        }

        const isAdmin = req.user && req.user.role === 'ADMIN';

        // Safety check — intercept pertanyaan medis berbahaya hanya jika bukan admin
        if (!isAdmin && SafetyLayer.isMedicalEmergencyOrDiagnosis(message)) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            const safeMsg = SafetyLayer.getEscalationMessage();
            res.write(`data: ${JSON.stringify({ token: safeMsg })}\n\n`);
            res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
            return res.end();
        }

        let systemContext = '';
        let customPrompt = null;

        const userIdentity = req.user
            ? `[DATA IDENTITAS PENGGUNA YANG SEDANG LOGIN SAAT INI]:\n- Nama: ${req.user.name || 'Admin'}\n- Email: ${req.user.email || '-'}\n- Role: ${req.user.role === 'ADMIN' ? 'Administrator' : 'Customer'}\n\n`
            : '';

        if (isAdmin) {
            // Mode ADMIN: Baca seluruh database sistem
            try {
                const dbContext = await ContextBuilder.buildContext(req.user, message);
                systemContext = `${userIdentity}[REFERENSI DATA DATABASE POSTGRESQL (Gunakan HANYA jika relevan dengan pertanyaan spesifik Admin, jangan paparkan jika tidak diminta)]:\n${dbContext}`;
                customPrompt = NvidiaLLMProvider.ADMIN_SYSTEM_PROMPT;
            } catch (dbErr) {
                console.warn('[Chatbot Admin] Gagal membaca database:', dbErr.message);
                systemContext = userIdentity;
                customPrompt = NvidiaLLMProvider.ADMIN_SYSTEM_PROMPT;
            }
        } else {
            // Mode CUSTOMER: Baca data user & rekomendasi
            let userContext = '';
            let recommendations = '';

            try {
                const [ctx, recs] = await Promise.all([
                    ContextBuilder.buildContext(req.user, message),
                    RecommendationService.getProductRecommendations(message),
                ]);
                userContext = ctx || '';
                recommendations = recs || '';
            } catch (dbErr) {
                console.warn('[Chatbot Customer] Gagal membaca database untuk konteks AI:', dbErr.message);
            }

            systemContext = userIdentity;
            if (userContext) {
                systemContext += `Data pengguna saat ini (dari database):\n${userContext.substring(0, 600)}\n\n`;
            }
            if (recommendations) {
                systemContext += `Rekomendasi produk yang tersedia di katalog kami:\n${recommendations.substring(0, 400)}`;
            }
            customPrompt = NvidiaLLMProvider.SYSTEM_PROMPT;
        }

        // Set SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        // Stream tokens ke client (dengan konteks database & persona prompt yang sesuai)
        let tokenCount = 0;
        await NvidiaLLMProvider.generateStream(message, (token) => {
            tokenCount++;
            res.write(`data: ${JSON.stringify({ token })}\n\n`);
        }, systemContext, customPrompt);

        if (tokenCount === 0) {
            res.write(`data: ${JSON.stringify({ token: 'Maaf, saya tidak bisa memproses pertanyaan itu. Coba tanyakan dengan cara lain ya! 😊' })}\n\n`);
        }

        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();

    } catch (err) {
        console.error("Chatbot Stream Error:", err.message);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Terjadi kesalahan pada AI server.' });
        } else {
            res.write(`data: ${JSON.stringify({ error: 'Terjadi kesalahan: ' + (err.message || 'Unknown') })}\n\n`);
            res.end();
        }
    }
};

module.exports = {
    chatbot_stream_post
};
