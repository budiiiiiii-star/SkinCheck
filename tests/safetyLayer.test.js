const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const SafetyLayer = require('../src/services/ai/SafetyLayer');

describe('Unit Test: SafetyLayer (Guardrail AI Medis)', () => {
    it('Harus mendeteksi pesan yang mengandung kondisi medis darurat atau diagnosa', () => {
        const emergencyMessages = [
            'Wajah saya berdarah dan bengkak parah',
            'Ada nanah di pipi apakah ini infeksi kulit?',
            'Minta resep obat dokter untuk alergi berat',
            'Apakah benjolan ini kanker atau melanoma?'
        ];

        for (const msg of emergencyMessages) {
            const isEmergency = SafetyLayer.isMedicalEmergencyOrDiagnosis(msg);
            assert.equal(isEmergency, true, `Pesan "${msg}" seharusnya terdeteksi sebagai kondisi medis.`);
        }
    });

    it('Harus mengizinkan pertanyaan seputar skincare dan kosmetik umum (non-medis)', () => {
        const safeMessages = [
            'Bagaimana cara memakai sunscreen yang benar?',
            'Rekomendasi pelembab untuk kulit berminyak',
            'Apa fungsi niacinamide dalam serum?',
            'Apakah toner dipakai sebelum atau sesudah cuci muka?'
        ];

        for (const msg of safeMessages) {
            const isEmergency = SafetyLayer.isMedicalEmergencyOrDiagnosis(msg);
            assert.equal(isEmergency, false, `Pesan "${msg}" seharusnya dianggap aman/non-medis.`);
        }
    });

    it('Harus mengembalikan pesan eskalasi peringatan medis resmi', () => {
        const escalation = SafetyLayer.getEscalationMessage();
        assert.ok(typeof escalation === 'string', 'Pesan eskalasi harus bertipe string.');
        assert.ok(escalation.includes('Peringatan Keamanan'), 'Harus menyertakan header peringatan keamanan.');
        assert.ok(escalation.includes('Dermatologist') || escalation.includes('Dokter Spesialis Kulit'), 'Harus mengarahkan ke dokter spesialis kulit.');
    });
});
