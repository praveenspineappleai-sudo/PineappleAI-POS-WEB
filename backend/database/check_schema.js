// Check products table structure
const { sequelize } = require("../config/db");

async function checkSchema() {
  try {
    await sequelize.authenticate();
    
    console.log("📋 Products table structure:");
    const [productCols] = await sequelize.query("DESCRIBE products");
    console.table(productCols);
    
    console.log("\n📋 Prices table structure:");
    const [priceCols] = await sequelize.query("DESCRIBE prices");
    console.table(priceCols);
    
    console.log("\n📋 Sample product data:");
    const [sample] = await sequelize.query("SELECT * FROM products LIMIT 3");
    console.table(sample);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkSchema();
