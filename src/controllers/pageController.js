const AnalysisResultModel = require('../models/analysisResultModel');
const SunscreenResultModel = require('../models/sunscreenResultModel');

const home_get = (req, res) => {
    res.render('pages/index', { user: req.user });
};

const login_get = (req, res) => {
    // If already logged in, redirect to dashboard
    if (req.cookies && req.cookies.jwt) {
        const jwt = require('jsonwebtoken');
        try {
            const decodedToken = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET || 'fallback_secret_key');
            if (decodedToken.role === 'ADMIN') return res.redirect('/admin/dashboard');
            return res.redirect('/customer/dashboard');
        } catch (err) {
            // token invalid, ignore and show login
        }
    }
    res.render('pages/login', { error: null });
};

const register_get = (req, res) => {
    if (req.cookies && req.cookies.jwt) {
        const jwt = require('jsonwebtoken');
        try {
            const decodedToken = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET || 'fallback_secret_key');
            if (decodedToken.role === 'ADMIN') return res.redirect('/admin/dashboard');
            return res.redirect('/customer/dashboard');
        } catch (err) {
        }
    }
    res.render('pages/register', { error: null });
};

const customer_dashboard_get = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Ambil history face scan
        const history = await AnalysisResultModel.findAllByUserId(userId);
        
        let baseline = null;
        let previous = null;
        let current = null;
        let trend = null;

        if (history && history.length > 0) {
            baseline = history[0]; // Terlama (ASC order)
            current = history[history.length - 1]; // Terbaru
            if (history.length > 1) {
                previous = history[history.length - 2]; // Sebelum terbaru
                
                // Kalkulasi trend visual (Selisih Current - Previous)
                trend = {
                    acne: current.acne_score - previous.acne_score,
                    redness: current.redness_score - previous.redness_score,
                    texture: current.texture_score - previous.texture_score,
                    hyperpigmentation: current.hyperpigmentation_score - previous.hyperpigmentation_score,
                    overall: current.overall_score - previous.overall_score
                };
            }
        }

        // Ambil summary sunscreen
        const latestSunscreen = await SunscreenResultModel.findLatestByUserId(userId);

        res.render('pages/customer_dashboard', { 
            user: req.user,
            history,
            baseline,
            previous,
            current,
            trend,
            latestSunscreen
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Terjadi kesalahan memuat dashboard.');
    }
};

const admin_dashboard_get = (req, res) => {
    res.render('pages/admin_dashboard', { user: req.user });
};

module.exports = {
    home_get,
    login_get,
    register_get,
    customer_dashboard_get,
    admin_dashboard_get
};
