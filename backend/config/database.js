const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'root',
    database: process.env.DB_NAME || 'pos_dev',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const initTables = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS attributes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                category_id INT NOT NULL,
                attribute_name VARCHAR(255) NOT NULL,
                attribute_type VARCHAR(255) DEFAULT 'text',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS product_attribute_values (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                price_id INT NOT NULL,
                attribute_name VARCHAR(255) NOT NULL,
                attribute_value VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Custom attribute tables verified/created successfully.");
    } catch (err) {
        console.error("❌ Failed to initialize custom attribute tables:", err);
    }
};

initTables();

module.exports = pool;
