// Verify Notifications Table
const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
  }
);

async function verifyTable() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    // Check if table exists
    const [tables] = await sequelize.query(
      "SHOW TABLES LIKE 'notifications'"
    );
    
    if (tables.length > 0) {
      console.log("✅ Notifications table exists!");
      
      // Show table structure
      const [columns] = await sequelize.query("DESCRIBE notifications");
      console.log("\n📋 Table structure:");
      console.table(columns);
      
      // Count rows
      const [count] = await sequelize.query(
        "SELECT COUNT(*) as count FROM notifications"
      );
      console.log(`\n📊 Current notification count: ${count[0].count}`);
      
      console.log("\n✅ Verification complete - notifications system ready!");
    } else {
      console.error("❌ Notifications table not found!");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    process.exit(1);
  }
}

verifyTable();
