// Simple Inventory Scanner - Get business_id from any existing product
const { sequelize } = require("../config/db");

async function scanAndCreate() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected\n");

    // Step 1: Get all low stock items (without business filtering)
    const query = `
      SELECT p.id, p.name, pr.id as price_id, pr.quantity, c.colour_name, s.size
      FROM products p
      JOIN prices pr ON p.id = pr.product_id
      LEFT JOIN colors c ON pr.color_id = c.id
      LEFT JOIN sizes s ON pr.size_id = s.id
      WHERE pr.quantity <= 10
      ORDER BY pr.quantity ASC
    `;

    const [lowStockItems] = await sequelize.query(query);
    console.log(`📊 Found ${lowStockItems.length} low stock items\n`);

    if (lowStockItems.length === 0) {
      console.log("✅ No low stock items!");
      process.exit(0);
    }

    // Step 2: Get a business_id from any product (user is likely using one business)
    // Try to find in products that have been created/updated
    const [sampleProduct] = await sequelize.query(
      "SELECT id, name FROM products LIMIT 1"
    );
    
    if (!sampleProduct || sampleProduct.length === 0) {
      console.log("❌ No products found in database");
      process.exit(1);
    }

    // Ask user for business_id since we can't determine it automatically
    console.log(`\n⚠️  NOTICE: Cannot automatically detect business_id from schema.`);
    console.log(`Please check your AsyncStorage or database for your business_id.\n`);
    console.log(`For testing, I'll use business_id = 19 (from the error log you showed).\n`);
    
    const businessId = 19; // From user's error log
    
    let createdCount = 0;

    for (const item of lowStockItems) {
      const type = item.quantity === 0 ? "out_of_stock" : "low_stock";
      const title = item.quantity === 0 ? "⚠️ Out of Stock" : "📉 Low Stock Alert";
      const variant = `${item.colour_name || ""} ${item.size || ""}`.trim();
      const message = item.quantity === 0
        ? `${item.name}${variant ? ` (${variant})` : ""} is out of stock!`
        : `${item.name}${variant ? ` (${variant})` : ""} has only ${item.quantity} units left.`;

      // Check if already exists
      const [existing] = await sequelize.query(
        `SELECT id FROM notifications 
         WHERE business_id = ? AND product_id = ? AND type = ? AND is_read = 0`,
        { replacements: [businessId, item.id, type] }
      );

      if (existing.length === 0) {
        await sequelize.query(
          `INSERT INTO notifications (business_id, type, title, message, product_id, product_name, quantity)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          { replacements: [businessId, type, title, message, item.id, item.name, item.quantity] }
        );

        createdCount++;
        const emoji = item.quantity === 0 ? "🔴" : "🟡";
        console.log(`${emoji} ${title} - ${item.name} ${variant ? `(${variant})` : ''} [Qty: ${item.quantity}]`);
      }
    }

    console.log(`\n✅ Created ${createdCount} notifications!`);
    
    const [total] = await sequelize.query(
      `SELECT COUNT(*) as count FROM notifications WHERE business_id = ?`,
      { replacements: [businessId] }
    );
    
    console.log(`📊 Total notifications for business ${businessId}: ${total[0].count}\n`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

scanAndCreate();
