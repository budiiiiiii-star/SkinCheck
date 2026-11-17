/**
 * whatsappController.js
 * Controller untuk fitur WhatsApp Number Checker via Fonnte API.
 */
const FonnteService = require('../services/FonnteService');
const WhatsAppCheckModel = require('../models/whatsappCheckModel');

// In-memory rate limiter sederhana (per IP)
const rateLimitStore = new Map();
const RATE_LIMIT_MAX  = 10;  // maks request
const RATE_LIMIT_WINDOW = 60 * 1000; // per 1 menit

function checkRateLimit(ip) {
    const now = Date.now();
    const record = rateLimitStore.get(ip);
    if (!record || now > record.resetTime) {
        rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return { allowed: true };
    }
    record.count++;
    if (record.count > RATE_LIMIT_MAX) {
        const remainSec = Math.ceil((record.resetTime - now) / 1000);
        return { allowed: false, retryAfter: remainSec };
    }
    return { allowed: true };
}

// Inisialisasi tabel saat startup (best-effort)
WhatsAppCheckModel.createTable().catch(err =>
    console.warn('[WhatsApp] Gagal inisialisasi tabel:', err.message)
);

// ----------------------------------------------------------------
// GET /whatsapp/verify  → halaman verifikasi
// ----------------------------------------------------------------
exports.verify_page_get = (req, res) => {
    res.render('pages/whatsapp_verify', {
        user: req.user || null,
        title: 'Cek Nomor WhatsApp',
        result: null,
        error: null,
        isConfigured: FonnteService.isConfigured(),
    });
};

// ----------------------------------------------------------------
// POST /api/whatsapp/verify  → API endpoint (JSON)
// ----------------------------------------------------------------
exports.verify_post = async (req, res) => {
    // Rate limiting
    const ip = req.ip || req.connection.remoteAddress;
    const rl = checkRateLimit(ip);
    if (!rl.allowed) {
        return res.status(429).json({
            success: false,
            message: `Terlalu banyak permintaan. Coba lagi dalam ${rl.retryAfter} detik.`,
        });
    }

    const { phoneNumber } = req.body;

    // Validasi input
    if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.trim() === '') {
        return res.status(400).json({ success: false, message: 'Nomor telepon tidak boleh kosong.' });
    }

    // Normalisasi
    const { normalized, valid, message: validMsg } = FonnteService.normalizePhoneNumber(phoneNumber);
    if (!valid) {
        return res.status(400).json({ success: false, message: validMsg });
    }

    // Cek konfigurasi
    if (!FonnteService.isConfigured()) {
        return res.status(503).json({
            success: false,
            message: 'Fonnte API belum dikonfigurasi. Silakan hubungi administrator.',
        });
    }

    // Panggil Fonnte API
    const fonnte = await FonnteService.checkWhatsAppNumber(normalized);

    // Simpan ke DB (best-effort, tidak block response)
    const userId = req.user ? req.user.id : null;
    WhatsAppCheckModel.create({
        userId,
        phoneInput: phoneNumber.trim(),
        phoneNorm: normalized,
        status: fonnte.status,
        message: fonnte.message,
    }).catch(err => console.warn('[WhatsApp] Gagal simpan riwayat:', err.message));

    return res.json({
        success: true,
        phoneNumber: phoneNumber.trim(),
        normalizedPhone: normalized,
        status: fonnte.status,
        message: fonnte.message,
        checkedAt: new Date().toISOString(),
    });
};

// ----------------------------------------------------------------
// GET /whatsapp/history  → halaman riwayat
// ----------------------------------------------------------------
exports.history_page_get = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, search, page } = req.query;
        const result = await WhatsAppCheckModel.findAll({
            userId,
            status: status || 'all',
            search: search || '',
            page: parseInt(page) || 1,
            limit: 15,
        });
        const stats = await WhatsAppCheckModel.getStats(userId);
        res.render('pages/whatsapp_history', {
            title: 'Riwayat Cek WhatsApp',
            history: result,
            stats,
            filters: { status: status || 'all', search: search || '' },
        });
    } catch (err) {
        console.error('[WhatsApp] History error:', err.message);
        res.status(500).render('pages/whatsapp_history', {
            title: 'Riwayat Cek WhatsApp',
            history: { data: [], total: 0, page: 1, totalPages: 1 },
            stats: { total: 0, registered: 0, not_registered: 0, failed: 0 },
            filters: { status: 'all', search: '' },
            error: 'Gagal memuat riwayat.',
        });
    }
};

// ----------------------------------------------------------------
// GET /whatsapp/config  → halaman konfigurasi API (Admin only)
// ----------------------------------------------------------------
exports.config_page_get = async (req, res) => {
    return res.redirect('/admin/settings');
};

// ----------------------------------------------------------------
// OTP Store & Handlers
// ----------------------------------------------------------------
const otpStore = new Map(); // phoneNorm -> { otp, expiresAt, attempts, resendAfter, verified }

// Helper untuk mengecek apakah nomor sudah diverifikasi
exports.isPhoneVerified = (phoneNumber) => {
    const { normalized } = FonnteService.normalizePhoneNumber(phoneNumber);
    if (!normalized) return false;
    const record = otpStore.get(normalized);
    return !!(record && record.verified);
};

// POST /api/whatsapp/send-otp
exports.send_otp_post = async (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.trim() === '') {
        return res.status(400).json({ success: false, message: 'Nomor WhatsApp tidak boleh kosong.' });
    }

    const { normalized, valid, message } = FonnteService.normalizePhoneNumber(phoneNumber);
    if (!valid) {
        return res.status(400).json({ success: false, message });
    }

    if (!FonnteService.isConfigured()) {
        return res.status(503).json({ success: false, message: 'Layanan WhatsApp Fonnte belum dikonfigurasi di server.' });
    }

    const now = Date.now();
    const existing = otpStore.get(normalized);

    // Cooldown check (60 detik)
    if (existing && now < existing.resendAfter) {
        const waitSec = Math.ceil((existing.resendAfter - now) / 1000);
        return res.status(429).json({
            success: false,
            message: `Harap tunggu ${waitSec} detik sebelum mengirim ulang kode verifikasi.`,
            retryAfter: waitSec
        });
    }

    // Generate 6 digit angka OTP acak
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = now + 5 * 60 * 1000; // Berlaku 5 menit
    const resendAfter = now + 60 * 1000;   // Cooldown 60 detik

    const messageBody = `*SkinCheck - Kode Verifikasi*\n\nKode verifikasi Anda adalah: *${otp}*\n\nKode ini bersifat rahasia dan berlaku selama 5 menit. Jangan berikan kode ini kepada siapa pun.`;

    console.log(`\n========================================`);
    console.log(`[WhatsApp OTP] Mengirim ke: ${normalized}`);
    console.log(`[WhatsApp OTP] Kode OTP: ${otp}`);
    console.log(`========================================\n`);

    const sendResult = await FonnteService.sendMessage(normalized, messageBody);

    if (!sendResult.success) {
        return res.status(500).json({
            success: false,
            message: 'Gagal mengirim kode via WhatsApp: ' + (sendResult.message || 'Periksa koneksi Fonnte.')
        });
    }

    otpStore.set(normalized, {
        otp,
        expiresAt,
        attempts: 0,
        resendAfter,
        verified: false
    });

    return res.json({
        success: true,
        message: 'Kode verifikasi berhasil dikirim ke nomor WhatsApp Anda!',
        normalizedPhone: normalized,
        resendIn: 60
    });
};

// POST /api/whatsapp/verify-otp
exports.verify_otp_post = async (req, res) => {
    const { phoneNumber, otp } = req.body;
    if (!phoneNumber || !otp) {
        return res.status(400).json({ success: false, message: 'Nomor WhatsApp dan kode verifikasi wajib diisi.' });
    }

    const { normalized, valid } = FonnteService.normalizePhoneNumber(phoneNumber);
    if (!valid) {
        return res.status(400).json({ success: false, message: 'Nomor telepon tidak valid.' });
    }

    const record = otpStore.get(normalized);
    const now = Date.now();

    if (!record) {
        return res.status(400).json({ success: false, message: 'Silakan klik "Kirim Kode" terlebih dahulu.' });
    }

    if (now > record.expiresAt) {
        otpStore.delete(normalized);
        return res.status(400).json({ success: false, message: 'Kode verifikasi telah kedaluwarsa. Silakan minta kode baru.' });
    }

    if (record.attempts >= 5) {
        otpStore.delete(normalized);
        return res.status(400).json({ success: false, message: 'Terlalu banyak percobaan yang salah. Silakan minta kode baru.' });
    }

    if (record.otp !== String(otp).trim()) {
        record.attempts++;
        const remaining = 5 - record.attempts;
        return res.status(400).json({
            success: false,
            message: `Kode verifikasi salah. Sisa percobaan: ${remaining} kali.`
        });
    }

    // OTP Valid
    record.verified = true;
    return res.json({
        success: true,
        message: 'Nomor WhatsApp berhasil diverifikasi!',
        normalizedPhone: normalized
    });
};

