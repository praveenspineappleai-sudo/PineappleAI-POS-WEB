// Run Notifications Table Migration
const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Create a Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: console.log,
  }
);

async function runMigration() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log("✅ Database connected successfully!");

    // Read SQL file
    const sqlPath = path.join(__dirname, "notifications_schema.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    console.log("📄 Running SQL migration...");
    console.log(sql);

    // Execute SQL
    await sequelize.query(sql);

    console.log("✅ Notifications table created successfully!");
    
    // Verify table was created
    const [tables] = await sequelize.query(
      "SHOW TABLES LIKE 'notifications'"
    );
    
    if (tables.length > 0) {
      console.log("✅ Table verification passed - 'notifications' table exists");
      
      // Show table structure
      const [columns] = await sequelize.query("DESCRIBE notifications");
      console.log("\n📋 Table structure:");
      console.table(columns);
    } else {
      console.error("❌ Table verification failed - 'notifications' table not found");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
