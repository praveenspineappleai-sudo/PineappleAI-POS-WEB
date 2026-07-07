// Clear and rescan - removes business prefix from notifications
const { sequelize } = require("../config/db");

async function clearAndRescan() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected\n");

    const businessId = 19; // From error logs

    // Delete existing notifications
    await sequelize.query(
      "DELETE FROM notifications WHERE business_id = ?",
      { replacements: [businessId] }
    );
    console.log("🗑️  Cleared old notifications\n");

    // Helper function to strip prefix
    const stripPrefix = (name) => {
      if (!name) return name;
      const dotIndex = name.indexOf('.');
      return dotIndex > 0 ? name.substring(dotIndex + 1) : name;
    };

    // Get low stock items
    const query = `
      SELECT p.id, p.name, pr.quantity, c.colour_name, s.size
      FROM products p
      JOIN prices pr ON p.id = pr.product_id
      LEFT JOIN colors c ON pr.color_id = c.id
      LEFT JOIN sizes s ON pr.size_id = s.id
      WHERE pr.quantity <= 10
      ORDER BY pr.quantity ASC
    `;

    const [items] = await sequelize.query(query);
    console.log(`📊 Found ${items.length} low stock items\n`);

    let created = 0;

    for (const item of items) {
      const displayName = stripPrefix(item.name); // Strip prefix here!
      const type = item.quantity === 0 ? "out_of_stock" : "low_stock";
      const title = item.quantity === 0 ? "⚠️ Out of Stock" : "📉 Low Stock Alert";
      const variant = `${item.colour_name || ""} ${item.size || ""}`.trim();
      const message = item.quantity === 0
        ? `${displayName}${variant ? ` (${variant})` : ""} is out of stock!`
        : `${displayName}${variant ? ` (${variant})` : ""} has only ${item.quantity} units left.`;

      await sequelize.query(
        `INSERT INTO notifications (business_id, type, title, message, product_id, product_name, quantity)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        { replacements: [businessId, type, title, message, item.id, displayName, item.quantity] }
      );

      created++;
      const emoji = item.quantity === 0 ? "🔴" : "🟡";
      console.log(`${emoji} ${displayName} ${variant ? `(${variant})` : ''} - Qty: ${item.quantity}`);
    }

    console.log(`\n✅ Created ${created} notifications (without prefix)!\n`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

clearAndRescan();
