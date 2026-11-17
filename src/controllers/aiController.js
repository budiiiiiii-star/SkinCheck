const AIOrchestrator = require('../services/ai/AIOrchestrator');
const ContextBuilder = require('../services/ai/ContextBuilder');
const RAGService = require('../services/ai/RAGService');
const RecommendationService = require('../services/ai/RecommendationService');
const SafetyLayer = require('../services/ai/SafetyLayer');
const NvidiaLLMProvider = require('../services/ai/NvidiaLLMProvider');

const chat_page_get = (req, res) => {
    res.render('pages/ai_chat', { user: req.user });
};

const chat_message_post = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ success: false, message: 'Pesan kosong.' });
        }

        const aiReply = await AIOrchestrator.handleQuery(req.user, message);

        res.json({ success: true, reply: aiReply });
    } catch (err) {
        console.error("AI Chat Error:", err);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada AI server.' });
    }
};

// Streaming endpoint via SSE
const chat_stream_post = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ success: false, message: 'Pesan kosong.' });
        }

        const isAdmin = req.user && req.user.role === 'ADMIN';

        // Safety check — hanya untuk customer biasa (agar admin bebas menanyakan istilah medis/analisis kulit pengguna)
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
            ? `[DATA IDENTITAS PENGGUNA YANG SEDANG LOGIN SAAT INI]:\n- Nama: ${req.user.name || 'Pengguna'}\n- Email: ${req.user.email || '-'}\n- Role: ${req.user.role === 'ADMIN' ? 'Administrator' : 'Customer'}\n\n`
            : '';

        if (isAdmin) {
            // Mode ADMIN: Baca seluruh data database sistem (metrik, users, scans, sunscreen, products)
            const dbContext = await ContextBuilder.buildContext(req.user, message);
            systemContext = `${userIdentity}[REFERENSI DATA DATABASE POSTGRESQL (Gunakan HANYA jika relevan dengan pertanyaan spesifik Admin, jangan paparkan jika tidak diminta)]:\n${dbContext}`;
            customPrompt = NvidiaLLMProvider.ADMIN_SYSTEM_PROMPT;
        } else {
            // Mode CUSTOMER: Data profil pengguna, RAG, dan rekomendasi produk
            const userContext = await ContextBuilder.buildContext(req.user, message);
            const ragContext = await RAGService.retrieveKnowledge(message);
            const recommendations = await RecommendationService.getProductRecommendations(message);

            systemContext = userIdentity;
            if (userContext) systemContext += `Data pengguna:\n${userContext.substring(0, 500)}\n\n`;
            if (ragContext) systemContext += `Pengetahuan relevan:\n${ragContext.substring(0, 300)}\n\n`;
            if (recommendations) systemContext += `Rekomendasi produk:\n${recommendations.substring(0, 300)}`;
            customPrompt = NvidiaLLMProvider.SYSTEM_PROMPT;
        }

        // Set SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        // Stream tokens to client
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
        console.error("AI Stream Error:", err.message);
        console.error("Error status:", err.status);
        console.error("Error detail:", JSON.stringify(err.error || {}));
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Terjadi kesalahan pada AI server.' });
        } else {
            res.write(`data: ${JSON.stringify({ error: 'Terjadi kesalahan: ' + (err.message || 'Unknown') })}\n\n`);
            res.end();
        }
    }
};

module.exports = {
    chat_page_get,
    chat_message_post,
    chat_stream_post
};
