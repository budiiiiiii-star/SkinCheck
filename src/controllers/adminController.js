const AdminModel = require('../models/adminModel');
const ProductModel = require('../models/productModel');
const UserModel = require('../models/userModel');
const jwt = require('jsonwebtoken');

const dashboard_get = async (req, res) => {
    try {
        const metrics = await AdminModel.getDashboardMetrics();
        res.render('pages/admin_dashboard', { user: req.user, metrics });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading dashboard");
    }
};

const users_get = async (req, res) => {
    try {
        const usersList = await AdminModel.getAllUsers();
        res.render('pages/admin_users', { user: req.user, usersList });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading users");
    }
};

const users_toggle_post = async (req, res) => {
    try {
        const { userId, status } = req.body;
        const newStatus = status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        await AdminModel.toggleUserStatus(userId, newStatus);
        res.json({ success: true, newStatus });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
};

const products_get = async (req, res) => {
    try {
        const products = await ProductModel.findAll();
        res.render('pages/admin_products', { user: req.user, products });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading products");
    }
};

const product_create_post = async (req, res) => {
    try {
        const { brand, name, category, description, ingredients, skin_concern, usage_guidance } = req.body;
        // Parse skin_concern as array if it comes as comma separated
        const skinConcernArr = skin_concern ? skin_concern.split(',').map(s => s.trim()) : [];
        await ProductModel.create(brand, name, category, description, ingredients, skinConcernArr, usage_guidance);
        res.redirect('/admin/products');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error creating product");
    }
};

const product_toggle_post = async (req, res) => {
    try {
        const { productId, status } = req.body;
        const newStatus = status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        const p = await ProductModel.findById(productId);
        if (p) {
            await ProductModel.update(p.id, p.brand, p.name, p.category, p.description, p.ingredients, p.skin_concern, p.usage_guidance, newStatus);
            res.json({ success: true, newStatus });
        } else {
            res.status(404).json({ success: false });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
};

const scans_get = (req, res) => {
    // Placeholder for detailed scan logs
    res.render('pages/admin_scans', { user: req.user, title: 'Riwayat Scan' });
};

const configService = require('../services/configService');
const LLMFactory = require('../services/ai/LLMProviderFactory');
const FonnteService = require('../services/FonnteService');

const settings_get = async (req, res) => {
    try {
        const config = configService.getConfig();
        res.render('pages/admin_settings', {
            user: req.user,
            title: 'Konfigurasi Sistem',
            config,
            saved: req.query.saved === '1',
            error: null
        });
    } catch (err) {
        console.error('[Admin Settings] Error:', err);
        res.status(500).send('Error loading settings');
    }
};

const settings_post = async (req, res) => {
    try {
        // Pass raw body directly — configService handles env key pattern matching
        const result = configService.updateConfig(req.body);

        if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
            return res.json(result);
        }
        return res.redirect('/admin/settings?saved=1');
    } catch (err) {
        console.error('[Admin Settings Update] Error:', err);
        if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
            return res.status(500).json({ success: false, message: 'Gagal memperbarui konfigurasi: ' + err.message });
        }
        res.redirect('/admin/settings?error=1');
    }
};

// Test AI: accepts { provider } in body, tests that specific provider
const test_ai_post = async (req, res) => {
    try {
        const { provider } = req.body || {};
        const result = await LLMFactory.testConnection(provider || null);
        return res.json(result);
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const test_fonnte_post = async (req, res) => {
    try {
        const result = await FonnteService.testConnection();
        return res.json(result);
    } catch (err) {
        return res.status(500).json({ connected: false, message: err.message });
    }
};

const NotificationService = require('../services/notificationService');

const notifications_get = async (req, res) => {
    try {
        const data = await NotificationService.getAdminNotifications(15);
        return res.json({ success: true, ...data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const notification_read_post = async (req, res) => {
    try {
        const { id } = req.params;
        await NotificationService.markAsRead(id);
        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const notification_read_all_post = async (req, res) => {
    try {
        await NotificationService.markAllAsRead();
        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const profile_name_post = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
                return res.status(400).json({ success: false, message: 'Nama tidak boleh kosong.' });
            }
            return res.redirect('/admin/settings?error=' + encodeURIComponent('Nama tidak boleh kosong.'));
        }

        const trimmedName = name.trim();
        await UserModel.updateName(req.user.id, trimmedName);

        // Perbarui JWT Cookie dengan nama baru
        const token = jwt.sign(
            { id: req.user.id, role: req.user.role, name: trimmedName, onboarding_completed: req.user.onboarding_completed || false },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '1d' }
        );
        res.cookie('jwt', token, { 
            httpOnly: true, 
            maxAge: 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        req.user.name = trimmedName;

        if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
            return res.json({ success: true, name: trimmedName, message: 'Nama Administrator berhasil diperbarui!' });
        }
        return res.redirect('/admin/settings?name_updated=1');
    } catch (err) {
        console.error('[Admin Profile Update] Error:', err);
        if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
            return res.status(500).json({ success: false, message: 'Gagal mengubah nama: ' + err.message });
        }
        return res.redirect('/admin/settings?error=' + encodeURIComponent(err.message));
    }
};

module.exports = {
    dashboard_get,
    users_get,
    users_toggle_post,
    products_get,
    product_create_post,
    product_toggle_post,
    scans_get,
    settings_get,
    settings_post,
    test_ai_post,
    test_fonnte_post,
    notifications_get,
    notification_read_post,
    notification_read_all_post,
    profile_name_post
};
