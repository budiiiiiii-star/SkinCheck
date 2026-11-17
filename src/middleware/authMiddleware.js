const jwt = require('jsonwebtoken');
require('dotenv').config();

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key', (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.redirect('/login');
            } else {
                req.user = decodedToken;
                next();
            }
        });
    } else {
        res.redirect('/login');
    }
};

const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.redirect('/login');
        }
        
        if (req.user.role === role) {
            next();
        } else {
            res.status(403).send('Forbidden: Anda tidak memiliki akses ke halaman ini.');
        }
    };
};

const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key', (err, decodedToken) => {
            if (err) {
                res.locals.user = null;
                next();
            } else {
                res.locals.user = decodedToken;
                next();
            }
        });
    } else {
        res.locals.user = null;
        next();
    }
};

const requireOnboarding = (req, res, next) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    
    if (req.user.role === 'ADMIN') {
        return next(); // Admin doesn't need customer onboarding
    }

    if (req.user.onboarding_completed) {
        next();
    } else {
        res.redirect('/onboarding');
    }
};

module.exports = { requireAuth, requireRole, checkUser, requireOnboarding };
