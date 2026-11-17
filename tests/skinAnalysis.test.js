const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const SkinAnalysisService = require('../src/services/SkinAnalysisService');

describe('Unit Test: SkinAnalysisService (Analisis Kondisi Kulit)', () => {
    it('Harus mengembalikan struktur metrik skor kulit lengkap', async () => {
        const result = await SkinAnalysisService.analyze('dummy_path.jpg');

        assert.ok(result, 'Hasil analisis tidak boleh null.');
        assert.ok(typeof result.acne_score === 'number', 'acne_score harus number.');
        assert.ok(typeof result.redness_score === 'number', 'redness_score harus number.');
        assert.ok(typeof result.texture_score === 'number', 'texture_score harus number.');
        assert.ok(typeof result.hyperpigmentation_score === 'number', 'hyperpigmentation_score harus number.');
        assert.ok(typeof result.overall_score === 'number', 'overall_score harus number.');

        // Validasi rentang nilai 0 - 100
        assert.ok(result.acne_score >= 0 && result.acne_score <= 100);
        assert.ok(result.redness_score >= 0 && result.redness_score <= 100);
        assert.ok(result.texture_score >= 0 && result.texture_score <= 100);
        assert.ok(result.hyperpigmentation_score >= 0 && result.hyperpigmentation_score <= 100);
        assert.ok(result.overall_score >= 0 && result.overall_score <= 100);
    });

    it('Harus menyertakan objek ai_response dengan disclaimer non-medis', async () => {
        const result = await SkinAnalysisService.analyze('dummy_path.jpg');

        assert.ok(result.ai_response, 'Harus memiliki ai_response.');
        assert.ok(typeof result.ai_response.summary === 'string');
        assert.ok(result.ai_response.summary.includes('tidak bersifat medis'));
    });
});
