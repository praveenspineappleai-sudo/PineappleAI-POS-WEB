// Notification Routes
const express = require("express");
const router = express.Router();
const notificationController = require("../Controllers/notificationController");

// Get notifications for a business
router.get("/", notificationController.getNotifications);

// Get unread count
router.get("/unread-count", notificationController.getUnreadCount);

// Create notification
router.post("/create", notificationController.createNotification);

// Mark single notification as read
router.put("/:id/read", notificationController.markAsRead);

// Mark all notifications as read
router.put("/mark-all-read", notificationController.markAllAsRead);

module.exports = router;
