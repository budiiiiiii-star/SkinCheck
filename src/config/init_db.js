const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

const initDb = async () => {
    const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'CUSTOMER',
        status VARCHAR(50) DEFAULT 'ACTIVE',
        profile_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;

    const createSkinScansTableQuery = `
    CREATE TABLE IF NOT EXISTS skin_scans (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        image_path TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'PENDING',
        image_quality_score FLOAT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;

    const createAnalysisResultsTableQuery = `
    CREATE TABLE IF NOT EXISTS analysis_results (
        id SERIAL PRIMARY KEY,
        skin_scan_id INTEGER REFERENCES skin_scans(id) ON DELETE CASCADE,
        acne_score FLOAT,
        redness_score FLOAT,
        texture_score FLOAT,
        hyperpigmentation_score FLOAT,
        overall_score FLOAT,
        ai_response JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;

    try {
        console.log("Creating users table if not exists...");
        await pool.query(createUsersTableQuery);
        console.log("Users table created successfully.");

        console.log("Creating skin_scans table if not exists...");
        await pool.query(createSkinScansTableQuery);
        console.log("Skin_scans table created successfully.");

        console.log("Creating analysis_results table if not exists...");
        await pool.query(createAnalysisResultsTableQuery);
        console.log("Analysis_results table created successfully.");

        const createSunscreenResultsTableQuery = `
        CREATE TABLE IF NOT EXISTS sunscreen_results (
            id SERIAL PRIMARY KEY,
            skin_scan_id INTEGER REFERENCES skin_scans(id) ON DELETE CASCADE,
            coverage_score FLOAT,
            coverage_status VARCHAR(50),
            heatmap_path TEXT,
            low_coverage_areas JSONB,
            analysis_method VARCHAR(100) DEFAULT 'VISUAL_ESTIMATION',
            hardware_type VARCHAR(50) DEFAULT 'RGB_CAMERA',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;
        console.log("Creating sunscreen_results table if not exists...");
        await pool.query(createSunscreenResultsTableQuery);
        console.log("Sunscreen_results table created successfully.");

        const createProductsTableQuery = `
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            brand VARCHAR(100) NOT NULL,
            name VARCHAR(255) NOT NULL,
            category VARCHAR(100),
            description TEXT,
            ingredients TEXT,
            skin_concern JSONB,
            usage_guidance TEXT,
            status VARCHAR(20) DEFAULT 'ACTIVE',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;
        console.log("Creating products table if not exists...");
        await pool.query(createProductsTableQuery);
        console.log("Products table created successfully.");
        
    } catch (err) {
        console.error("Error creating tables:", err);
    } finally {
        pool.end();
    }
};

initDb();
