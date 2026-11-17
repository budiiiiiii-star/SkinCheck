const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const CoverageEstimationService = require('../src/services/CoverageEstimationService');

describe('Unit Test: CoverageEstimationService (Estimasi Sunscreen)', () => {
    it('Harus mengembalikan skor dan status cakupan tabir surya yang valid', async () => {
        const result = await CoverageEstimationService.estimateCoverage('dummy_sunscreen.jpg');

        assert.ok(result, 'Hasil estimasi tidak boleh null.');
        assert.ok(typeof result.score === 'number', 'Skor coverage harus bertipe number.');
        assert.ok(result.score >= 0 && result.score <= 100, 'Skor harus di rentang 0-100.');
        
        const validStatuses = ['Sangat Baik', 'Cukup', 'Rendah'];
        assert.ok(validStatuses.includes(result.status), `Status "${result.status}" harus valid.`);
        assert.ok(Array.isArray(result.lowCoverageAreas), 'lowCoverageAreas harus berupa array.');
    });
});
