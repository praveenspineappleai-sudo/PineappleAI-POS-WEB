// Check tables and create notifications
const { sequelize } = require("../config/db");

async function setup() {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to database");

    // Check for businesses table
    const [tables] = await sequelize.query("SHOW TABLES");
    console.log("📋 Available tables:", tables.map(t => Object.values(t)[0]));

    // Find the business table name
    const businessTable = tables.find(t => {
      const tableName = Object.values(t)[0].toLowerCase();
      return tableName.includes('business');
    });

    if (businessTable) {
      const actualTableName = Object.values(businessTable)[0];
      console.log(`✅ Found business table: ${actualTableName}`);

      // Create notifications table with correct FK reference
      const sql = `
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  business_id INT NOT NULL,
  type ENUM('low_stock', 'out_of_stock', 'product_added', 'product_updated') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  product_id INT,
  product_name VARCHAR(255),
  quantity INT DEFAULT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_business_id (business_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `;

      console.log("📄 Creating notifications table (without FK for now)...");
      await sequelize.query(sql);
      console.log("✅ Notifications table created!");

      // Verify
      const [result] = await sequelize.query("SHOW TABLES LIKE 'notifications'");
      if (result.length > 0) {
        console.log("✅ Verification passed!");
        const [columns] = await sequelize.query("DESCRIBE notifications");
        console.table(columns);
      }
    } else {
      console.log("⚠️ No business table found, creating without FK");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

setup();
