const NotificationModel = require('../models/notificationModel');
const FonnteService = require('./FonnteService');

class NotificationService {
    /**
     * Hitung waktu relatif dalam Bahasa Indonesia
     */
    static formatTimeAgo(date) {
        const now = new Date();
        const diffSec = Math.floor((now - new Date(date)) / 1000);

        if (diffSec < 60) return 'Baru saja';
        const diffMin = Math.floor(diffSec / 60);
        if (diffMin < 60) return `${diffMin} menit yang lalu`;
        const diffHour = Math.floor(diffMin / 60);
        if (diffHour < 24) return `${diffHour} jam yang lalu`;
        const diffDay = Math.floor(diffHour / 24);
        if (diffDay < 7) return `${diffDay} hari yang lalu`;
        return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    /**
     * Berikan notifikasi bahwa user baru telah mendaftar
     * @param {Object} user - data user { id, name, email, phone_number }
     */
    static async notifyNewUser(user) {
        try {
            const title = 'Pengguna Baru Terdaftar 👤';
            const phoneInfo = user.phone_number ? ` (WA: ${user.phone_number})` : '';
            const message = `${user.name} (${user.email})${phoneInfo} baru saja mendaftar sebagai customer.`;

            // 1. Simpan ke Database
            const notif = await NotificationModel.create({
                type: 'NEW_USER',
                title,
                message,
                data: {
                    userId: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone_number || null,
                    registeredAt: new Date().toISOString()
                }
            });

            // 2. Kirim pesan WhatsApp ke Admin (jika nomor Admin dikonfigurasi di .env)
            const adminPhone = process.env.ADMIN_WHATSAPP_PHONE || process.env.ADMIN_PHONE;
            if (adminPhone && FonnteService.isConfigured()) {
                const norm = FonnteService.normalizePhoneNumber(adminPhone);
                if (norm.valid) {
                    const waMessage = 
`🔔 *Notifikasi SkinCheck Admin*

Ada customer baru terdaftar di platform:
• *Nama*: ${user.name}
• *Email*: ${user.email}
• *Nomor Telepon*: ${user.phone_number || '-'}
• *Waktu*: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}

Silakan login ke Admin Dashboard untuk melihat detail pengguna.`;
                    
                    FonnteService.sendMessage(norm.normalized, waMessage).catch(err => {
                        console.warn('[NotificationService] Gagal kirim WA notifikasi ke Admin:', err.message);
                    });
                }
            }

            return notif;
        } catch (err) {
            console.error('[NotificationService] Error notifying new user:', err);
            return null;
        }
    }

    /**
     * Ambil notifikasi terbaru beserta unread count
     */
    static async getAdminNotifications(limit = 10) {
        try {
            const [recent, unreadCount] = await Promise.all([
                NotificationModel.getRecent(limit),
                NotificationModel.getUnreadCount()
            ]);

            const formatted = recent.map(n => ({
                id: n.id,
                type: n.type,
                title: n.title,
                message: n.message,
                data: n.data,
                is_read: n.is_read,
                timeAgo: this.formatTimeAgo(n.created_at),
                created_at: n.created_at
            }));

            return { unreadCount, notifications: formatted };
        } catch (err) {
            console.error('[NotificationService] Error getAdminNotifications:', err);
            return { unreadCount: 0, notifications: [] };
        }
    }

    static async markAsRead(id) {
        return await NotificationModel.markAsRead(id);
    }

    static async markAllAsRead() {
        return await NotificationModel.markAllAsRead();
    }
}

module.exports = NotificationService;

