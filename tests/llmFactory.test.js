const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
    PROVIDERS,
    SYSTEM_PROMPT,
    ADMIN_SYSTEM_PROMPT,
    getActiveProvider
} = require('../src/services/ai/LLMProviderFactory');

describe('Unit Test: LLMProviderFactory (Arsitektur Multi-LLM)', () => {
    it('Harus mendukung semua 6 provider utama yang ditentukan', () => {
        const expectedProviders = ['nvidia', 'gemini', 'openai', 'anthropic', 'groq', 'ollama'];
        for (const provider of expectedProviders) {
            assert.ok(PROVIDERS[provider], `Provider "${provider}" harus terdaftar.`);
            assert.ok(PROVIDERS[provider].label, `Provider "${provider}" harus memiliki label.`);
        }
    });

    it('Harus memiliki System Prompt Customer yang melarang diagnosis penyakit', () => {
        assert.ok(typeof SYSTEM_PROMPT === 'string');
        assert.ok(SYSTEM_PROMPT.includes('SkinCheck AI Assistant'));
        assert.ok(SYSTEM_PROMPT.includes('JANGAN pernah mendiagnosis penyakit kulit'));
    });

    it('Harus memiliki Admin System Prompt dengan instruksi peran Administrator', () => {
        assert.ok(typeof ADMIN_SYSTEM_PROMPT === 'string');
        assert.ok(ADMIN_SYSTEM_PROMPT.includes('SkinCheck AI Admin Assistant'));
        assert.ok(ADMIN_SYSTEM_PROMPT.includes('Administrator'));
    });

    it('Harus mengembalikan provider aktif default yang valid', () => {
        const active = getActiveProvider();
        assert.ok(typeof active === 'string');
        assert.ok(Object.keys(PROVIDERS).includes(active), `Active provider "${active}" harus ada di PROVIDERS.`);
    });
});
