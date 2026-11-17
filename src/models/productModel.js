const db = require('../config/db');

class ProductModel {
    static async create(brand, name, category, description, ingredients, skin_concern, usage_guidance) {
        const query = `
            INSERT INTO products 
            (brand, name, category, description, ingredients, skin_concern, usage_guidance)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [brand, name, category, description, ingredients, JSON.stringify(skin_concern), usage_guidance];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async findAll() {
        const query = 'SELECT * FROM products ORDER BY brand ASC, name ASC;';
        const result = await db.query(query);
        return result.rows;
    }

    static async findAllActive() {
        const query = 'SELECT * FROM products WHERE status = $1 ORDER BY brand ASC, name ASC;';
        const result = await db.query(query, ['ACTIVE']);
        return result.rows;
    }

    static async findById(id) {
        const query = 'SELECT * FROM products WHERE id = $1;';
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    static async update(id, brand, name, category, description, ingredients, skin_concern, usage_guidance, status) {
        const query = `
            UPDATE products 
            SET brand = $1, name = $2, category = $3, description = $4, 
                ingredients = $5, skin_concern = $6, usage_guidance = $7, status = $8, updated_at = CURRENT_TIMESTAMP
            WHERE id = $9
            RETURNING *;
        `;
        const values = [brand, name, category, description, ingredients, JSON.stringify(skin_concern), usage_guidance, status, id];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async delete(id) {
        const query = 'DELETE FROM products WHERE id = $1 RETURNING *;';
        const result = await db.query(query, [id]);
        return result.rows[0];
    }
}

module.exports = ProductModel;
