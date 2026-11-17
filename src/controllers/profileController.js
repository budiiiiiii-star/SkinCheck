const UserModel = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Create token function (needs to be available here too to update token)
const createToken = (id, role, name, onboarding_completed = false) => {
    return jwt.sign({ id, role, name, onboarding_completed }, process.env.JWT_SECRET || 'fallback_secret_key', {
        expiresIn: '1d'
    });
};

const onboarding_get = async (req, res) => {
    // If onboarding is already completed, redirect to dashboard
    if (req.user && req.user.onboarding_completed) {
        return res.redirect('/customer/dashboard');
    }
    res.render('pages/onboarding', { error: null });
};

const onboarding_post = async (req, res) => {
    const { age, gender, skin_type, skincare_goals, skincare_preferences, current_products, consent_privacy, consent_camera, consent_face_data } = req.body;

    // Basic Validation
    if (!age || !gender || !skin_type || !consent_privacy || !consent_camera || !consent_face_data) {
        return res.render('pages/onboarding', { error: 'Harap isi semua field wajib dan berikan persetujuan (consent) yang diperlukan.' });
    }

    try {
        const profileData = {
            age: parseInt(age, 10),
            gender,
            skin_type,
            skincare_goals: Array.isArray(skincare_goals) ? skincare_goals : [skincare_goals].filter(Boolean),
            skincare_preferences,
            current_products,
            consents: {
                privacy_policy: consent_privacy === 'on',
                camera_usage: consent_camera === 'on',
                face_data_usage: consent_face_data === 'on',
                timestamp: new Date().toISOString()
            },
            onboarding_completed: true
        };

        await UserModel.updateProfileData(req.user.id, profileData);

        // Update JWT to reflect onboarding_completed = true
        const token = createToken(req.user.id, req.user.role, req.user.name, true);
        res.cookie('jwt', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

        res.redirect('/customer/dashboard');
    } catch (err) {
        console.error(err);
        res.render('pages/onboarding', { error: 'Terjadi kesalahan saat menyimpan data onboarding.' });
    }
};

const profile_get = async (req, res) => {
    try {
        const user = await UserModel.findById(req.user.id);
        const profileData = user.profile_data || {};
        res.render('pages/profile', { user: req.user, profileData, error: null, success: null });
    } catch (err) {
        console.error(err);
        res.redirect('/customer/dashboard');
    }
};

const profile_post = async (req, res) => {
    const { age, gender, skin_type, skincare_goals, skincare_preferences, current_products } = req.body;

    try {
        const user = await UserModel.findById(req.user.id);
        const existingProfileData = user.profile_data || {};

        const updatedProfileData = {
            ...existingProfileData, // Preserve consents and onboarding status
            age: age ? parseInt(age, 10) : existingProfileData.age,
            gender: gender || existingProfileData.gender,
            skin_type: skin_type || existingProfileData.skin_type,
            skincare_goals: skincare_goals ? (Array.isArray(skincare_goals) ? skincare_goals : [skincare_goals]) : existingProfileData.skincare_goals,
            skincare_preferences: skincare_preferences || existingProfileData.skincare_preferences,
            current_products: current_products || existingProfileData.current_products,
        };

        await UserModel.updateProfileData(req.user.id, updatedProfileData);
        
        res.render('pages/profile', { user: req.user, profileData: updatedProfileData, error: null, success: 'Profil berhasil diperbarui!' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Terjadi kesalahan pada server saat memperbarui profil.');
    }
};

const account_delete_post = async (req, res) => {
    try {
        await UserModel.deleteAccount(req.user.id);
        res.cookie('jwt', '', { maxAge: 1 }); // Clear cookie
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Gagal menghapus akun.');
    }
};

module.exports = {
    onboarding_get,
    onboarding_post,
    profile_get,
    profile_post,
    account_delete_post
};
