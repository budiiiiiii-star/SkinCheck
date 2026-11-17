const db = require('../config/db');

class UserModel {
    static async create(name, email, passwordHash, role = 'CUSTOMER', phoneNumber = null, whatsappVerified = false) {
        const query = `
            INSERT INTO users (name, email, password_hash, role, phone_number, whatsapp_verified) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *;
        `;
        const values = [name, email, passwordHash, role, phoneNumber, whatsappVerified];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1;';
        const result = await db.query(query, [email]);
        return result.rows[0];
    }

    static async findById(id) {
        const query = 'SELECT * FROM users WHERE id = $1;';
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    static async updateProfileData(id, profileData) {
        const query = `
            UPDATE users 
            SET profile_data = $1, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $2 
            RETURNING *;
        `;
        const result = await db.query(query, [JSON.stringify(profileData), id]);
        return result.rows[0];
    }

    static async updateName(id, name) {
        const query = `
            UPDATE users 
            SET name = $1, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $2 
            RETURNING *;
        `;
        const result = await db.query(query, [name, id]);
        return result.rows[0];
    }

    static async deleteAccount(id) {
        const query = 'DELETE FROM users WHERE id = $1 RETURNING *;';
        const result = await db.query(query, [id]);
        return result.rows[0];
    }
}

module.exports = UserModel;