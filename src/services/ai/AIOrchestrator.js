const ContextBuilder = require('./ContextBuilder');
const SafetyLayer = require('./SafetyLayer');
const RAGService = require('./RAGService');
const RecommendationService = require('./RecommendationService');
const NvidiaLLMProvider = require('./NvidiaLLMProvider');
const SkinAnalyzerModel = require('./SkinAnalyzerModel');

class AIOrchestrator {
    static async handleQuery(user, userMessage, imageBuffer = null) {
        const isAdmin = user && user.role === 'ADMIN';

        // 1. Pre-Processing (Safety Check) — hanya untuk customer biasa
        if (!isAdmin && SafetyLayer.isMedicalEmergencyOrDiagnosis(userMessage)) {
            return SafetyLayer.getEscalationMessage();
        }

        // 1.5 Image Analysis (jika ada upload gambar)
        let imageAnalysisText = "";
        if (imageBuffer) {
            const analysisResult = await SkinAnalyzerModel.analyzeImage(imageBuffer);
            if (analysisResult) {
                imageAnalysisText = `[IMAGE ANALYSIS RESULT]: The uploaded image indicates ${analysisResult.detected_conditions.join(', ')} with a confidence of ${(analysisResult.confidence * 100).toFixed(2)}%.`;
            }
        }

        const userIdentity = user
            ? `[DATA IDENTITAS PENGGUNA YANG SEDANG LOGIN SAAT INI]:\n- Nama: ${user.name || 'Admin'}\n- Email: ${user.email || '-'}\n- Role: ${user.role === 'ADMIN' ? 'Administrator' : 'Customer'}\n\n`
            : '';

        if (isAdmin) {
            // Mode Admin: Gunakan database context & admin persona
            const dbContext = await ContextBuilder.buildContext(user, userMessage);
            let finalPrompt = `${userIdentity}[REFERENSI DATA DATABASE SKINCHECK (Gunakan HANYA jika relevan dengan pertanyaan)]:\n${dbContext}\n\n`;
            if (imageAnalysisText) {
                finalPrompt += `${imageAnalysisText}\n\n`;
            }
            finalPrompt += `[PERTANYAAN ADMINISTRATOR]: ${userMessage}\n\n(Catatan: Jawab HANYA apa yang ditanyakan di atas. Jangan paparkan rangkuman database jika tidak diminta.)`;

            return await NvidiaLLMProvider.generateResponse(finalPrompt, NvidiaLLMProvider.ADMIN_SYSTEM_PROMPT);
        }

        // Mode Customer biasa
        const userContext = await ContextBuilder.buildContext(user, userMessage);
        const ragContext = await RAGService.retrieveKnowledge(userMessage);
        const recommendations = await RecommendationService.getProductRecommendations(userMessage);

        let finalPrompt = `[SYSTEM]: You are a Skincare AI Assistant. You educate users on OTC cosmetics and skincare routines. You NEVER diagnose diseases.\n`;
        if (userIdentity) finalPrompt += `${userIdentity}\n`;
        finalPrompt += `[CONTEXT]:\n${userContext}\n`;
        
        if (ragContext) {
            finalPrompt += `[KNOWLEDGE]:\n${ragContext}\n`;
        }
        
        if (recommendations) {
            finalPrompt += `[SUGGESTIONS]:\n${recommendations}\n`;
        }

        if (imageAnalysisText) {
            finalPrompt += `${imageAnalysisText}\n`;
        }

        finalPrompt += `[USER MESSAGE]: ${userMessage}`;

        const aiResponse = await NvidiaLLMProvider.generateResponse(finalPrompt, NvidiaLLMProvider.SYSTEM_PROMPT);

        if (SafetyLayer.isMedicalEmergencyOrDiagnosis(aiResponse)) {
            return SafetyLayer.getEscalationMessage();
        }

        return aiResponse;
    }
}

module.exports = AIOrchestrator;
