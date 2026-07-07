// Notification Controller
const { sequelize } = require("../config/db");
const { emitNotification, emitUnreadCount } = require("../config/socket");

// Helper to get and emit unread count
const updateUnreadCount = async (business_id) => {
  try {
    const [result] = await sequelize.query(
      "SELECT COUNT(*) as count FROM notifications WHERE business_id = ? AND is_read = FALSE",
      { replacements: [business_id] }
    );
    const count = result[0].count;
    emitUnreadCount(business_id, count);
    return count;
  } catch (error) {
    console.error("❌ Error updating unread count:", error);
  }
};

// Create notification
const createNotification = async (req, res) => {
  try {
    const { business_id, type, title, message, product_id, product_name, quantity } = req.body;

    const query = `
      INSERT INTO notifications (business_id, type, title, message, product_id, product_name, quantity)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await sequelize.query(query, {
      replacements: [
        business_id,
        type,
        title,
        message,
        product_id || null,
        product_name || null,
        quantity || null,
      ],
    });

    const [notification] = await sequelize.query(
      "SELECT * FROM notifications WHERE id = LAST_INSERT_ID()",
      { replacements: [] }
    );

    const newNotification = notification[0];

    // Emit real-time events
    emitNotification(business_id, newNotification);
    await updateUnreadCount(business_id);

    res.status(201).json({
      success: true,
      notification: newNotification,
    });
  } catch (error) {
    console.error("❌ Create notification error:", error);
    res.status(500).json({ error: "Failed to create notification" });
  }
};

// Get notifications for a business
const getNotifications = async (req, res) => {
  try {
    const { business_id } = req.query;
    const { is_read, limit = 50 } = req.query;

    let query = "SELECT * FROM notifications WHERE business_id = ?";
    const replacements = [business_id];

    if (is_read !== undefined) {
      query += " AND is_read = ?";
      replacements.push(is_read === "true" ? 1 : 0);
    }

    query += " ORDER BY created_at DESC LIMIT ?";
    replacements.push(parseInt(limit));

    const [notifications] = await sequelize.query(query, { replacements });

    res.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("❌ Get notifications error:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const { business_id } = req.query;

    const [result] = await sequelize.query(
      "SELECT COUNT(*) as count FROM notifications WHERE business_id = ? AND is_read = FALSE",
      { replacements: [business_id] }
    );

    res.json({
      success: true,
      count: result[0].count,
    });
  } catch (error) {
    console.error("❌ Get unread count error:", error);
    res.status(500).json({ error: "Failed to get unread count" });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    // Get business_id before updating to emit event later
    const [notif] = await sequelize.query(
      "SELECT business_id FROM notifications WHERE id = ?",
      { replacements: [id] }
    );

    if (notif.length === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    const business_id = notif[0].business_id;

    await sequelize.query(
      "UPDATE notifications SET is_read = TRUE WHERE id = ?",
      { replacements: [id] }
    );

    // Update unread count
    await updateUnreadCount(business_id);

    res.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("❌ Mark as read error:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
};

// Mark all as read for a business
const markAllAsRead = async (req, res) => {
  try {
    const { business_id } = req.body;

    await sequelize.query(
      "UPDATE notifications SET is_read = TRUE WHERE business_id = ? AND is_read = FALSE",
      { replacements: [business_id] }
    );

    // Update unread count (should be 0)
    emitUnreadCount(business_id, 0);

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("❌ Mark all as read error:", error);
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
};

// Helper: Check low stock and create notifications
const checkLowStock = async (business_id) => {
  try {
    // 1. Get business name for the prefix
    const [business] = await sequelize.query(
      "SELECT name FROM business_details WHERE id = ?",
      { replacements: [business_id] }
    );

    if (!business || business.length === 0) {
      console.warn(`⚠️ Business ID ${business_id} not found for stock check`);
      return [];
    }

    const businessName = business[0].name;
    const prefix = `${businessName}.`;

    // 2. Get all products with low stock for this business
    const query = `
      SELECT p.id, p.name, pr.id as price_id, pr.quantity, c.colour_name, s.size
      FROM products p
      JOIN prices pr ON p.id = pr.product_id
      LEFT JOIN colors c ON pr.color_id = c.id
      LEFT JOIN sizes s ON pr.size_id = s.id
      WHERE p.name LIKE ? AND pr.quantity <= 10
    `;

    const [lowStockItems] = await sequelize.query(query, {
      replacements: [`${prefix}%`],
    });

    const notifications = [];
    let newCreated = false;

    for (const item of lowStockItems) {
      const type = item.quantity === 0 ? "out_of_stock" : "low_stock";
      const title = item.quantity === 0 ? "⚠️ Out of Stock" : "📉 Low Stock Alert";
      const variant = `${item.colour_name || ""} ${item.size || ""}`.trim();
      const message = item.quantity === 0
        ? `${item.name}${variant ? ` (${variant})` : ""} is out of stock!`
        : `${item.name}${variant ? ` (${variant})` : ""} has only ${item.quantity} units left.`;

      // Check if notification already exists (avoid duplicates)
      const [existing] = await sequelize.query(
        `SELECT id FROM notifications 
         WHERE business_id = ? AND product_id = ? AND type = ? AND is_read = FALSE`,
        { replacements: [business_id, item.id, type] }
      );

      if (existing.length === 0) {
        await sequelize.query(
          `INSERT INTO notifications (business_id, type, title, message, product_id, product_name, quantity)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          {
            replacements: [business_id, type, title, message, item.id, item.name, item.quantity],
          }
        );

        const [newNotification] = await sequelize.query(
          "SELECT * FROM notifications WHERE id = LAST_INSERT_ID()",
          { replacements: [] }
        );

        const notif = newNotification[0];
        notifications.push(notif);
        emitNotification(business_id, notif);
        newCreated = true;
      }
    }

    if (newCreated) {
      await updateUnreadCount(business_id);
    }

    return notifications;
  } catch (error) {
    console.error("❌ Check low stock error:", error);
    return [];
  }
};

module.exports = {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  checkLowStock,
};
