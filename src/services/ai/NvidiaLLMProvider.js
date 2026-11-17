/**
 * NvidiaLLMProvider.js - Legacy shim.
 * Sekarang mendelegasikan ke LLMProviderFactory (multi-provider).
 * Dipertahankan untuk backward compatibility dengan kode lama.
 */
const Factory = require('./LLMProviderFactory');

class NvidiaLLMProvider {
    static async testConnection(customKey, customBaseUrl, customModel) {
        return Factory.testConnection('nvidia');
    }

    static async generateResponse(prompt, customSystemPrompt) {
        return Factory.generateResponse(prompt, customSystemPrompt);
    }

    static async generateStream(userMessage, onChunk, systemContext, customSystemPrompt) {
        return Factory.generateStream(userMessage, onChunk, systemContext, customSystemPrompt);
    }
}

NvidiaLLMProvider.SYSTEM_PROMPT       = Factory.SYSTEM_PROMPT;
NvidiaLLMProvider.ADMIN_SYSTEM_PROMPT = Factory.ADMIN_SYSTEM_PROMPT;

module.exports = NvidiaLLMProvider;
module.exports.SYSTEM_PROMPT       = Factory.SYSTEM_PROMPT;
module.exports.ADMIN_SYSTEM_PROMPT = Factory.ADMIN_SYSTEM_PROMPT;
