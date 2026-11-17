const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const pageController = require('../controllers/pageController');
const profileController = require('../controllers/profileController');
const scanController = require('../controllers/scanController');
const { requireAuth, requireRole, checkUser, requireOnboarding } = require('../middleware/authMiddleware');

// Check user for all GET routes
router.get('*', checkUser);

// Pages routes
router.get('/', pageController.home_get);
router.get('/login', pageController.login_get);
router.get('/register', pageController.register_get);

// Onboarding and Profile routes
router.get('/onboarding', requireAuth, profileController.onboarding_get);
router.post('/onboarding', requireAuth, profileController.onboarding_post);
router.get('/profile', requireAuth, profileController.profile_get);
router.post('/profile', requireAuth, profileController.profile_post);
router.post('/profile/delete-account', requireAuth, profileController.account_delete_post);

// Scan routes
router.get('/scan', requireAuth, requireOnboarding, scanController.scan_page_get);
router.post('/scan/upload', requireAuth, requireOnboarding, scanController.scan_upload_post);
router.get('/scan/image/:id', requireAuth, scanController.scan_image_get);

// Analysis route
const analysisController = require('../controllers/analysisController');
router.get('/analysis/:scanId', requireAuth, analysisController.analyze_get);

// Sunscreen routes
const sunscreenController = require('../controllers/sunscreenController');
router.get('/sunscreen/scan', requireAuth, requireOnboarding, sunscreenController.scan_page_get);
router.post('/sunscreen/upload', requireAuth, requireOnboarding, sunscreenController.scan_upload_post);
router.get('/sunscreen/result/:scanId', requireAuth, sunscreenController.result_get);

// AI Chat routes
const aiController = require('../controllers/aiController');
router.get('/ai/chat', requireAuth, requireOnboarding, aiController.chat_page_get);
router.post('/ai/chat', requireAuth, requireOnboarding, aiController.chat_message_post);
router.post('/ai/chat/stream', requireAuth, requireOnboarding, aiController.chat_stream_post);

// Chatbot Widget API (floating chat di Beranda/Dashboard)
const chatbotController = require('../controllers/chatbotController');
router.post('/api/chatbot/stream', requireAuth, chatbotController.chatbot_stream_post);

// Auth API routes
router.post('/register', authController.register_post);
router.post('/login', authController.login_post);
router.get('/logout', authController.logout_get);

// Protected routes
router.get('/customer/dashboard', requireAuth, requireRole('CUSTOMER'), requireOnboarding, pageController.customer_dashboard_get);

// Recommendation Routes
const productController = require('../controllers/productController');
router.get('/customer/recommendations', requireAuth, requireOnboarding, productController.recommendations_get);

// Admin Routes
const adminController = require('../controllers/adminController');
router.get('/admin/dashboard', requireAuth, requireRole('ADMIN'), adminController.dashboard_get);
router.get('/admin/users', requireAuth, requireRole('ADMIN'), adminController.users_get);
router.post('/admin/users/toggle', requireAuth, requireRole('ADMIN'), adminController.users_toggle_post);
router.get('/admin/products', requireAuth, requireRole('ADMIN'), adminController.products_get);
router.post('/admin/products/create', requireAuth, requireRole('ADMIN'), adminController.product_create_post);
router.post('/admin/products/toggle', requireAuth, requireRole('ADMIN'), adminController.product_toggle_post);
router.get('/admin/scans', requireAuth, requireRole('ADMIN'), adminController.scans_get);
router.get('/admin/settings', requireAuth, requireRole('ADMIN'), adminController.settings_get);
router.post('/admin/settings', requireAuth, requireRole('ADMIN'), adminController.settings_post);
router.post('/admin/profile/update-name', requireAuth, requireRole('ADMIN'), adminController.profile_name_post);
router.post('/api/admin/test-ai', requireAuth, requireRole('ADMIN'), adminController.test_ai_post);
router.post('/api/admin/test-fonnte', requireAuth, requireRole('ADMIN'), adminController.test_fonnte_post);

// Admin Notifications API
router.get('/api/admin/notifications', requireAuth, requireRole('ADMIN'), adminController.notifications_get);
router.post('/api/admin/notifications/:id/read', requireAuth, requireRole('ADMIN'), adminController.notification_read_post);
router.post('/api/admin/notifications/read-all', requireAuth, requireRole('ADMIN'), adminController.notification_read_all_post);


// WhatsApp Number Checker & OTP Routes (Fonnte API)
const whatsappController = require('../controllers/whatsappController');
// Allow verify page and API publicly (guest + auth)
router.get('/whatsapp/verify', whatsappController.verify_page_get);
router.post('/api/whatsapp/verify', whatsappController.verify_post);
router.post('/api/whatsapp/send-otp', whatsappController.send_otp_post);
router.post('/api/whatsapp/verify-otp', whatsappController.verify_otp_post);
router.get('/whatsapp/history', requireAuth, whatsappController.history_page_get);
router.get('/whatsapp/config', requireAuth, requireRole('ADMIN'), whatsappController.config_page_get);

module.exports = router;


