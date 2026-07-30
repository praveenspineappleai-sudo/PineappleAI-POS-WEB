// backend/routes/categoryAttributes.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // Your database connection

// Create table for category attributes
router.post('/create-table', async (req, res) => {
    const { categoryName, attributes } = req.body;
    
    try {
        // Create the main category table
        const tableName = `category_${categoryName.toLowerCase().replace(/\s+/g, '_')}_attributes`;
        
        // Drop table if exists (optional - be careful in production)
        // await pool.query(`DROP TABLE IF EXISTS ${tableName}`);
        
        // Create table with columns for each attribute
        let createTableSQL = `
            CREATE TABLE IF NOT EXISTS ${tableName} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT,
                product_variant_id INT,
        `;
        
        // Add columns for each attribute
        attributes.forEach(attr => {
            const columnName = attr.labelName.toLowerCase().replace(/\s+/g, '_');
            if (attr.type === 'select') {
                createTableSQL += `${columnName} VARCHAR(255), `;
            } else {
                createTableSQL += `${columnName} VARCHAR(255), `;
            }
        });
        
        createTableSQL += `
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id),
                FOREIGN KEY (product_variant_id) REFERENCES product_variants(id)
            )
        `;
        
        await pool.query(createTableSQL);
        
        // Create separate table for attribute values lookup
        const valuesTableName = `${tableName}_values`;
        const createValuesTableSQL = `
            CREATE TABLE IF NOT EXISTS ${valuesTableName} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                attribute_name VARCHAR(255),
                attribute_value VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_attribute_value (attribute_name, attribute_value)
            )
        `;
        
        await pool.query(createValuesTableSQL);
        
        // Insert attribute values
        attributes.forEach(attr => {
            attr.values.forEach(value => {
                pool.query(
                    `INSERT IGNORE INTO ${valuesTableName} (attribute_name, attribute_value) VALUES (?, ?)`,
                    [attr.labelName, value]
                );
            });
        });
        
        res.status(200).json({
            success: true,
            message: `Table ${tableName} created successfully`,
            tableName
        });
        
    } catch (error) {
        console.error('Error creating category table:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get attribute values for a category
router.get('/:categoryName/:attributeName', async (req, res) => {
    const { categoryName, attributeName } = req.params;
    
    try {
        const tableName = `category_${categoryName.toLowerCase().replace(/\s+/g, '_')}_attributes_values`;
        
        const [rows] = await pool.query(
            `SELECT attribute_value FROM ${tableName} WHERE attribute_name = ? ORDER BY attribute_value`,
            [attributeName]
        );
        
        res.status(200).json({
            success: true,
            values: rows.map(row => row.attribute_value)
        });
        
    } catch (error) {
        console.error('Error fetching attribute values:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;