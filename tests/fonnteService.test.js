const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { normalizePhoneNumber, STATUS } = require('../src/services/FonnteService');

describe('Unit Test: FonnteService (Normalisasi Nomor WhatsApp)', () => {
    it('Harus menormalisasi format nomor lokal berawalan 0 ke kode negara 62', () => {
        const input = '081234567890';
        const result = normalizePhoneNumber(input);

        assert.equal(result.valid, true);
        assert.equal(result.normalized, '6281234567890');
        assert.equal(result.message, 'OK');
    });

    it('Harus menormalisasi format nomor internasional berawalan +62', () => {
        const input = '+6289876543210';
        const result = normalizePhoneNumber(input);

        assert.equal(result.valid, true);
        assert.equal(result.normalized, '6289876543210');
    });

    it('Harus membersihkan karakter spasi, tanda strip, titik, dan kurung', () => {
        const input = '  0812-3456-(7890)  ';
        const result = normalizePhoneNumber(input);

        assert.equal(result.valid, true);
        assert.equal(result.normalized, '6281234567890');
    });

    it('Harus menolak nomor kosong, null, atau bukan string', () => {
        const emptyResult = normalizePhoneNumber('');
        assert.equal(emptyResult.valid, false);
        assert.equal(emptyResult.normalized, null);

        const nullResult = normalizePhoneNumber(null);
        assert.equal(nullResult.valid, false);
    });

    it('Harus menolak nomor dengan panjang tidak valid atau bukan angka', () => {
        const shortNumber = normalizePhoneNumber('0812');
        assert.equal(shortNumber.valid, false);

        const textInput = normalizePhoneNumber('nomorteleponku');
        assert.equal(textInput.valid, false);
    });

    it('Harus memiliki definisi status enum yang lengkap', () => {
        assert.equal(STATUS.REGISTERED, 'registered');
        assert.equal(STATUS.NOT_REGISTERED, 'not_registered');
        assert.equal(STATUS.INVALID_NUMBER, 'invalid_number');
    });
});
