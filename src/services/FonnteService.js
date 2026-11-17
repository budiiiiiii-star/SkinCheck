/**
 * FonnteService.js - Server-side service Fonnte WhatsApp API.
 * API Key TIDAK PERNAH dikirim ke frontend.
 */

function getApiUrl() {
    return process.env.FONNTE_API_URL || 'https://api.fonnte.com';
}

function getApiKey() {
    return process.env.FONNTE_API_KEY || '';
}

const STATUS = {
    REGISTERED: 'registered',
    NOT_REGISTERED: 'not_registered',
    INVALID_NUMBER: 'invalid_number',
    VERIFICATION_FAILED: 'verification_failed',
    UNKNOWN: 'unknown',
};

function isConfigured() {
    return !!(getApiKey() && getApiUrl());
}

function normalizePhoneNumber(phoneNumber) {
    if (!phoneNumber || typeof phoneNumber !== 'string') {
        return { normalized: null, valid: false, message: 'Nomor telepon tidak boleh kosong.' };
    }
    let cleaned = phoneNumber.trim().replace(/[\s\-().]/g, '');
    if (cleaned.startsWith('+')) cleaned = cleaned.substring(1);
    if (cleaned.startsWith('0')) cleaned = '62' + cleaned.substring(1);
    const phoneRegex = /^62[0-9]{9,13}$/;
    if (!phoneRegex.test(cleaned)) {
        return { normalized: null, valid: false, message: 'Format nomor tidak valid. Gunakan format Indonesia (contoh: 08123456789 atau +6281234567890).' };
    }
    return { normalized: cleaned, valid: true, message: 'OK' };
}

async function checkWhatsAppNumber(normalizedPhone) {
    if (!isConfigured()) {
        return { status: STATUS.VERIFICATION_FAILED, message: 'Fonnte API belum dikonfigurasi di environment server.' };
    }
    const formData = new URLSearchParams();
    formData.append('target', normalizedPhone);
    formData.append('countryCode', '62');
    let response;
    try {
        response = await fetch(`${getApiUrl()}/validate`, {
            method: 'POST',
            headers: { 'Authorization': getApiKey(), 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString(),
            signal: AbortSignal.timeout(15000),
        });
    } catch (err) {
        if (err.name === 'TimeoutError' || err.name === 'AbortError') {
            return { status: STATUS.VERIFICATION_FAILED, message: 'Permintaan ke Fonnte API timeout.' };
        }
        return { status: STATUS.VERIFICATION_FAILED, message: 'Gagal terhubung ke Fonnte API.' };
    }
    let data;
    try { data = await response.json(); } catch { return { status: STATUS.VERIFICATION_FAILED, message: 'Respons Fonnte tidak dapat dibaca.' }; }
    if (!data.status) {
        const reason = data.reason || '';
        if (reason === 'token invalid')       return { status: STATUS.VERIFICATION_FAILED, message: 'API Key Fonnte tidak valid atau expired.' };
        if (reason === 'device disconnected') return { status: STATUS.VERIFICATION_FAILED, message: 'Perangkat WhatsApp di Fonnte tidak terhubung.' };
        if (reason === 'target required')     return { status: STATUS.INVALID_NUMBER, message: 'Nomor telepon tidak boleh kosong.' };
        if (reason === 'target invalid')      return { status: STATUS.INVALID_NUMBER, message: 'Format nomor tidak dikenali oleh Fonnte.' };
        return { status: STATUS.VERIFICATION_FAILED, message: `Fonnte API error: ${reason || 'Unknown error'}` };
    }
    const registered    = Array.isArray(data.registered)     ? data.registered     : [];
    const notRegistered = Array.isArray(data.not_registered) ? data.not_registered : [];
    if (registered.includes(normalizedPhone) || (registered.length > 0 && !notRegistered.includes(normalizedPhone))) {
        return { status: STATUS.REGISTERED, message: 'Nomor ini terdaftar di WhatsApp.' };
    }
    if (notRegistered.includes(normalizedPhone) || notRegistered.length > 0) {
        return { status: STATUS.NOT_REGISTERED, message: 'Nomor ini tidak terdaftar di WhatsApp.' };
    }
    return { status: STATUS.UNKNOWN, message: 'Fonnte tidak dapat menentukan status nomor ini.' };
}

async function testConnection() {
    if (!isConfigured()) return { connected: false, message: 'FONNTE_API_KEY tidak ditemukan di environment.' };
    
    // First try device status endpoint
    try {
        const start = Date.now();
        const res = await fetch(`${getApiUrl()}/device`, {
            method: 'POST',
            headers: { 'Authorization': getApiKey() },
            signal: AbortSignal.timeout(10000)
        });
        const latency = Date.now() - start;
        const data = await res.json();
        if (data.status) {
            const deviceStatus = data.device_status || (data.status ? 'connected' : 'disconnected');
            return {
                connected: true,
                latency,
                deviceStatus,
                device: data.device || '-',
                name: data.name || '-',
                package: data.package || '-',
                quota: data.quota || '-',
                expired: data.expired || '-',
                message: `Koneksi berhasil (${latency}ms). Status WhatsApp: ${deviceStatus.toUpperCase()}`
            };
        }
        if (data.reason === 'token invalid') {
            return { connected: false, message: 'Token Fonnte tidak valid atau telah kedaluwarsa.' };
        }
    } catch (err) {
        // Fallback below
    }

    // Fallback: check dummy number
    const result = await checkWhatsAppNumber('628000000000');
    if (result.status === STATUS.VERIFICATION_FAILED && (result.message.includes('tidak valid') || result.message.includes('tidak terhubung'))) {
        return { connected: false, message: result.message };
    }
    return { connected: true, message: 'Koneksi ke Fonnte API berhasil.' };
}

async function sendMessage(target, message) {
    if (!isConfigured()) {
        return { success: false, message: 'Fonnte API belum dikonfigurasi di environment server.' };
    }
    const formData = new URLSearchParams();
    formData.append('target', target);
    formData.append('message', message);
    formData.append('countryCode', '62');

    let response;
    try {
        response = await fetch(`${getApiUrl()}/send`, {
            method: 'POST',
            headers: {
                'Authorization': getApiKey(),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString(),
            signal: AbortSignal.timeout(15000),
        });
    } catch (err) {
        if (err.name === 'TimeoutError' || err.name === 'AbortError') {
            return { success: false, message: 'Pengiriman pesan WhatsApp timeout.' };
        }
        return { success: false, message: 'Gagal terhubung ke Fonnte API untuk mengirim pesan.' };
    }

    let data;
    try {
        data = await response.json();
    } catch {
        return { success: false, message: 'Respons pengiriman Fonnte tidak valid.' };
    }

    if (!data.status) {
        return { success: false, message: data.reason || 'Gagal mengirim pesan WhatsApp via Fonnte.' };
    }

    return { success: true, message: 'Pesan berhasil dikirim.', data };
}

module.exports = { STATUS, isConfigured, normalizePhoneNumber, checkWhatsAppNumber, testConnection, sendMessage };

