// Socket.IO Configuration
const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

// Initialize Socket.IO
const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: [
        "http://192.168.0.178:5000",
        "https://pos-web-dev.pineappleai.cloud",
        "httpsd://superadmin-pos-mobile-dev.pineappleai.cloud",
        "http://localhost:3000",
        "http://pos-web-dev.pineappleai.cloud",
        "http://192.168.0.178:5000",
        "exp://192.168.1.9:8081", // Expo development
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Socket.IO authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.businessId = decoded.business_id;
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  // Connection handler
  io.on("connection", (socket) => {
    console.log(`✅ Socket connected: ${socket.id}, Business: ${socket.businessId}`);

    // Join business room for targeted broadcasts
    socket.join(`business_${socket.businessId}`);

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });

    // Test event
    socket.on("ping", () => {
      socket.emit("pong", { message: "Socket connection active" });
    });
  });

  console.log("🔌 Socket.IO server initialized");
  return io;
};

// Get Socket.IO instance
const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};

// Emit notification to specific business
const emitNotification = (business_id, notification) => {
  try {
    const io = getIO();
    io.to(`business_${business_id}`).emit("new_notification", notification);
    console.log(`📢 Notification emitted to business_${business_id}:`, notification.title);
  } catch (error) {
    console.error("❌ Error emitting notification:", error);
  }
};

// Emit unread count update
const emitUnreadCount = (business_id, count) => {
  try {
    const io = getIO();
    io.to(`business_${business_id}`).emit("unread_count_update", { count });
    console.log(`🔔 Unread count updated for business_${business_id}: ${count}`);
  } catch (error) {
    console.error("❌ Error emitting unread count:", error);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitNotification,
  emitUnreadCount,
};
