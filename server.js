require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./src/routes');

const app = express();
const PORT = process.env.PORT || 3000;

const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Manual Security Headers Middleware (Alternative to Helmet)
app.use((req, res, next) => {
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.removeHeader('X-Powered-By');
    next();
});

// Simple In-Memory Rate Limiter for AI endpoint
const rateLimitCache = new Map();
const aiRateLimiter = (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 10;
    
    if (!rateLimitCache.has(ip)) {
        rateLimitCache.set(ip, { count: 1, resetTime: now + windowMs });
        return next();
    }
    
    const record = rateLimitCache.get(ip);
    if (now > record.resetTime) {
        record.count = 1;
        record.resetTime = now + windowMs;
        return next();
    }
    
    record.count++;
    if (record.count > maxRequests) {
        return res.status(429).json({ success: false, message: 'Terlalu banyak permintaan. Silakan tunggu beberapa saat.' });
    }
    next();
};

app.use('/ai/chat', aiRateLimiter);
app.use('/api/chatbot', aiRateLimiter);

// Setup View Engine (EJS)
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));
app.set('layout', 'layout'); // Set default layout

// Static Assets
app.use(express.static(path.join(__dirname, 'assets'))); // adjust if necessary, originally src/public
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Routes
app.use('/', routes);

// Error Handling Middleware (Global)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Terjadi kesalahan pada server!');
});

// Start Server
app.listen(PORT, () => {
    console.log(`[+] Server SkinCheck berjalan di http://localhost:${PORT}`);
});
