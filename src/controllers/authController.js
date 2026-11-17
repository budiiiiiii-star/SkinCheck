const UserModel = require('../models/userModel');
const NotificationService = require('../services/notificationService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Create token function
const createToken = (id, role, name, onboarding_completed = false) => {
    return jwt.sign({ id, role, name, onboarding_completed }, process.env.JWT_SECRET || 'fallback_secret_key', {
        expiresIn: '1d'
    });
};

const register_post = async (req, res) => {
    const { name, email, password, phoneNumber, whatsappVerified } = req.body;

    try {
        // Cek apakah email sudah terdaftar
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            return res.render('pages/register', { error: 'Email sudah terdaftar.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const isVerified = whatsappVerified === 'true' || whatsappVerified === true;

        // Buat user baru, default role CUSTOMER dengan nomor WhatsApp dan status verifikasi
        const user = await UserModel.create(name, email, hashedPassword, 'CUSTOMER', phoneNumber || null, isVerified);

        // Notifikasi Admin (asinkron agar tidak memblokir registrasi user)
        NotificationService.notifyNewUser(user).catch(err => {
            console.warn('[Register] Gagal trigger notifikasi admin:', err.message);
        });

        // Buat token (baru register pasti belum onboarding)
        const token = createToken(user.id, user.role, user.name, false);
        res.cookie('jwt', token, { 
            httpOnly: true, 
            maxAge: 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        res.redirect('/customer/dashboard');
    } catch (err) {
        console.error('Register error:', err);
        res.render('pages/register', { error: 'Terjadi kesalahan pada server: ' + (err.message || '') });
    }
};

const login_post = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await UserModel.findByEmail(email);
        if (user) {
            const auth = await bcrypt.compare(password, user.password_hash);
            if (auth) {
                // Cek onboarding dari profile_data
                const isOnboarded = user.profile_data && user.profile_data.onboarding_completed ? true : false;
                
                const token = createToken(user.id, user.role, user.name, isOnboarded);
                res.cookie('jwt', token, { 
                    httpOnly: true, 
                    maxAge: 24 * 60 * 60 * 1000,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict'
                });
                
                if (user.role === 'ADMIN') {
                    res.redirect('/admin/dashboard');
                } else {
                    res.redirect('/customer/dashboard');
                }
                return;
            }
        }
        res.render('pages/login', { error: 'Email atau password salah.' });
    } catch (err) {
        console.error(err);
        res.render('pages/login', { error: 'Terjadi kesalahan pada server.' });
    }
};

const logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/login');
};

module.exports = {
    register_post,
    login_post,
    logout_get
};