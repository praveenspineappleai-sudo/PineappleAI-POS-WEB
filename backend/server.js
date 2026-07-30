// // const express = require("express");
// // const { connectDB } = require("./config/db"); // Import DB connection
// // const path = require('path');
// // const bodyParser = require('body-parser');

// // //Developed by M.Vaishnavi start 27/2
// // const customerRoutes = require('./routes/customersRouter'); // Import customer routes

// // //Developed by M.Vaishnavi start 31/3 end 31/3
// // const productsRouter = require('./routes/productsRouter'); // Import the products router

// // const sizeRouter = require("./routes/sizesRouter"); // Import the size router

// // const colorsRouter = require("./routes/colorsRouter"); // Import the colors router

// // //Developed by M.Vaishnavi start 01/4 end 02/4
// // const categoriesRouter = require('./routes/categoriesRouter'); // Import the categories router

// // const productCategoryRouter = require('./routes/productCategoryRouter');  // Import the productCategory route

// // const priceRoutes = require("./routes/pricesRouter"); // Import the price route

// // const barcodeRoutes = require("./routes/barcodeRouter"); // Import the barcode route

// // const app = express();

// // app.use(bodyParser.json());

// // // categories Routes
// // app.use('/api/categories', categoriesRouter);

// // // size Routes
// // app.use("/sizes", sizeRouter);

// // // colors Routes
// // app.use("/colors", colorsRouter);

// // // productCategory Routes
// // app.use('/api/product-categories', productCategoryRouter);

// // // price Routes
// // app.use("/api/prices", priceRoutes);

// // // barcode Routes
// // app.use("/api/barcodes", barcodeRoutes);
// // app.use("/public", express.static("public")); // Serve barcode images

// // // products Routes
// // app.use('/products', productsRouter);

// // //Developed by M.Vaishnavi start 27/2

// // // Middleware for parsing JSON
// // app.use(express.json());

// // // Routes for customer-related API
// // app.use('/api/customers', customerRoutes);

// // // 404 middleware for undefined routes
// // app.use((req, res, next) => {
// //   console.log(`Incoming request: ${req.method} ${req.url}`);
// //   next();
// // });

// // const PORT = process.env.PORT || 5000;

// // // Connect to the database
// // connectDB();

// // app.get("/", (req, res) => {
// //   res.send("API is running...");
// // });

// // app.listen(PORT, () => {
// //   console.log(`🚀 Server running on port `);
// // });

// // const express = require("express");
// // const path = require('path');
// // const bodyParser = require('body-parser');
// // const { connectDB } = require("./config/db"); // Import DB connection

// // // -------------------- Routes --------------------
// // // Developed by G.Sabisan
// // const productRoutes = require("./routes/searchProductRouter");
// // const categoryRoutes = require("./routes/searchCategoryRouter");
// // const salesRoutes = require("./routes/salesRouter");

// // // Developed by M.Vaishnavi
// // const customerRoutes = require('./routes/customersRouter');
// // const productsRouter = require('./routes/productsRouter');
// // const sizeRouter = require("./routes/sizesRouter");
// // const colorsRouter = require("./routes/colorsRouter");
// // const categoriesRouter = require('./routes/categoriesRouter');
// // const productCategoryRouter = require('./routes/productCategoryRouter');
// // const priceRoutes = require("./routes/pricesRouter");
// // const barcodeRoutes = require("./routes/barcodeRouter");

// // // -------------------- App Setup --------------------
// // const app = express();

// // // Middleware
// // app.use(express.json());
// // app.use(bodyParser.json());
// // app.use("/public", express.static("public")); // Serve barcode images

// // // -------------------- API Routes --------------------

// // // G.Sabisan routes
// // app.use("/api", productRoutes);
// // app.use("/api", categoryRoutes);
// // app.use("/api", salesRoutes);

// // // M.Vaishnavi routes
// // app.use('/api/customers', customerRoutes);
// // app.use('/products', productsRouter);
// // app.use('/api/categories', categoriesRouter);
// // app.use("/sizes", sizeRouter);
// // app.use("/colors", colorsRouter);
// // app.use('/api/product-categories', productCategoryRouter);
// // app.use("/api/prices", priceRoutes);
// // app.use("/api/barcodes", barcodeRoutes);

// // // 404 / logging middleware
// // app.use((req, res, next) => {
// //   console.log(`Incoming request: ${req.method} ${req.url}`);
// //   next();
// // });

// // // -------------------- DB & Server --------------------
// // const PORT = process.env.PORT || 5000;

// // // Connect to the database
// // connectDB();

// // // Root route
// // app.get("/", (req, res) => {
// //   res.send("API is running...");
// // });

// // // Start server
// // app.listen(PORT, () => {
// //   console.log(`🚀 Server running on port ${PORT}`);
// // });

// const express = require("express");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const bodyParser = require('body-parser');
// const { connectDB } = require("./config/db"); // Import DB connection

// // Load environment variables
// dotenv.config();

// // -------------------- Routes --------------------
// // Developed by G.Sabisan
// const productRoutes = require("./routes/searchProductRouter");
// const categoryRoutes = require("./routes/searchCategoryRouter");
// const salesRoutes = require("./routes/salesRouter");

// // Developed by M.Vaishnavi
// const customerRoutes = require('./routes/customersRouter');
// const productsRouter = require('./routes/productsRouter');
// const sizeRouter = require("./routes/sizesRouter");
// const colorsRouter = require("./routes/colorsRouter");
// const categoriesRouter = require('./routes/categoriesRouter');
// const productCategoryRouter = require('./routes/productCategoryRouter');
// const priceRoutes = require("./routes/pricesRouter");
// const barcodeRoutes = require("./routes/barcodeRouter");

// // Additional routes from new version
// const ordersRouter = require("./routes/ordersRouter");
// const barcodeSearchRoutes = require("./routes/barcodeSearchRouter.js");

// // -------------------- App Setup --------------------
// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(bodyParser.json());
// app.use("/public", express.static("public")); // Serve barcode images

// // -------------------- API Routes --------------------

// // G.Sabisan routes
// app.use("/api", productRoutes);
// app.use("/api", categoryRoutes);
// app.use("/api", salesRoutes);

// // M.Vaishnavi routes
// app.use('/api/customers', customerRoutes);
// app.use('/products', productsRouter);
// app.use('/api/categories', categoriesRouter);
// app.use("/sizes", sizeRouter);
// app.use("/colors", colorsRouter);
// app.use('/api/product-categories', productCategoryRouter);
// app.use("/api/prices", priceRoutes);
// app.use("/api/barcodes", barcodeRoutes);

// // Additional routes
// app.use("/api/barcode-search", barcodeSearchRoutes);
// app.use("/api/orders", ordersRouter);

// // 404 / logging middleware
// app.use((req, res, next) => {
//   console.log(`Incoming request: ${req.method} ${req.url}`);
//   next();
// });

// // -------------------- DB & Server --------------------
// const PORT = process.env.PORT || 5000;

// // Connect to the database
// connectDB();

// // Root route
// app.get("/", (req, res) => {
//   res.send("API is running...");
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http"); // ✅ For Socket.IO
const net = require("net");
const { connectDB } = require("./config/db");
const { initSocket } = require("./config/socket"); // ✅ Import socket config

// Load environment variables
dotenv.config();

// -------------------- Routes --------------------
const productRoutes = require("./routes/searchProductRouter");
const categoryRoutes = require("./routes/searchCategoryRouter");
const salesRoutes = require("./routes/salesRouter");
const customerRoutes = require("./routes/customersRouter");
const searchCustomerRoutes = require("./routes/searchCustomerRouter");
const productsRouter = require("./routes/productsRouter");
const sizeRouter = require("./routes/sizesRouter");
const colorsRouter = require("./routes/colorsRouter");
const categoriesRouter = require("./routes/categoriesRouter");
const productCategoryRouter = require("./routes/productCategoryRouter");
const priceRoutes = require("./routes/pricesRouter");
const barcodeRoutes = require("./routes/barcodeRouter");
const verifyRoutes = require("./routes/verifyRoutes");
const registerRoutes = require("./routes/registerRoutes");
const authRoutes = require("./routes/auth");
const cashierRoutes = require("./routes/cashierRoutes");
const ordersRouter = require("./routes/ordersRouter");
const barcodeSearchRoutes = require("./routes/barcodeSearchRouter.js");
const profileRoutes = require("./routes/profileRouter");
const shopRoutes = require("./routes/shopRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const notificationsRouter = require("./routes/notificationsRouter"); // ✅ Notifications
const deleteAccountRoutes = require("./routes/deleteAccountRoutes");
const businessDetailsRouter = require("./routes/businessDetailsRouter"); // Business details
const systemInfoRouter = require("./routes/systemInfoRouter"); // System info for debugging
const attributesRouter = require("./routes/attributes");

// -------------------- App Setup --------------------
const app = express();
const server = http.createServer(app); // ✅ Create HTTP server

// ✅ Initialize Socket.IO
const io = initSocket(server);

// -------------------- CORS Configuration --------------------
app.use(
  cors({
    origin: [
      "http://192.168.0.178:5000",
      "https://pos-web-dev.pineappleai.cloud",
      "https://superadmin-pos-mobile-dev.pineappleai.cloud",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://pos-web-dev.pineappleai.cloud",
      "https://pos-web-qa.pineappleai.cloud",
      "https://pos-web-beta.pineappleai.cloud",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(bodyParser.json());
app.use("/public", express.static("public"));

// -------------------- API Routes --------------------
app.use("/api", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/searchcustomers", searchCustomerRoutes);
app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/sizes", sizeRouter);
app.use("/api/colors", colorsRouter);
app.use("/api/product-categories", productCategoryRouter);
app.use("/api/prices", priceRoutes);
app.use("/api/barcodes", barcodeRoutes);
app.use("/api/barcode-search", barcodeSearchRoutes);
app.use("/api/orders", ordersRouter);
app.use("/api/verify", verifyRoutes);
app.use("/api/register", registerRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cashier", cashierRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api", shopRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationsRouter); // ✅ Notifications routes
app.use("/api/account", deleteAccountRoutes); // Account deletion
app.use("/api/business-details", businessDetailsRouter); // Business details
app.use("/api/system-info", systemInfoRouter); // System info for debugging
app.use("/api/public", require("./routes/publicBillRouter")); // Public access for bills
app.use("/api", attributesRouter);

// 404 / logging middleware
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// -------------------- DB & Server --------------------
const PORT = Number(process.env.PORT || 5000);

const startServer = (port) => {
  const onError = (error) => {
    if (error.code === "EADDRINUSE") {
      const fallbackPort = port + 1;
      console.warn(`⚠️ Port ${port} is already in use. Trying ${fallbackPort} instead...`);
      server.removeListener("error", onError);
      startServer(fallbackPort);
    } else {
      console.error("❌ Server failed to start:", error);
      process.exit(1);
    }
  };

  server.once("error", onError);

  server.listen(port, () => {
    server.removeListener("error", onError);
    console.log(`🚀 Server running on port ${port}`);
    console.log(`🔌 Socket.IO enabled on port ${port}`);
  });
};

// Connect to the database
connectDB();

// Root route
app.get("/", (req, res) => {
  res.send("API is running with Socket.IO...");
});

// ✅ Start server with Socket.IO
startServer(PORT);
