//path: Controllers/orderController.js
// const { CashierOrder, CashierBill, CashierPrice, Customer } = require("../models"); // Importing models
// const { Sequelize } = require("sequelize");
// const db = require("../models"); // Import database models

// // ✅ Function to create an order
// exports.createOrder = async (req, res) => {
//   const { customer_id, discounted_price, total_price, products } = req.body; // Extract data from request body

//   const transaction = await db.sequelize.transaction(); // Start transaction

//   try {
//     // ✅ Check if customer exists
//     const customer = await Customer.findByPk(customer_id);
//     if (!customer) {
//       return res.status(400).json({ message: "Customer not found" });
//     }

//     // ✅ Generate Order Number
//     const orderNo = `ORD-${Date.now()}`;
//     const currentDate = new Date();

//     let orderEntries = [];
//     let calculatedTotalPrice = 0;

//     // ✅ Process each product in the order
//     for (const product of products) {
//       const price = await CashierPrice.findByPk(product.price_id);
//       if (!price) {
//         return res.status(400).json({
//           message: `Price not found for price_id: ${product.price_id}`,
//         });
//       }

//       const orderedTotalPrice = price.selling_price * product.ordered_quantity;
//       calculatedTotalPrice += orderedTotalPrice;

//       // ✅ Create order entry in the database
//       const order = await CashierOrder.create(
//         {
//           order_no: orderNo,
//           ordered_total_price: orderedTotalPrice,
//           price_id: product.price_id,
//           customer_id,
//           ordered_quantity: product.ordered_quantity,
//           date: currentDate,
//         },
//         { transaction }
//       );

//       orderEntries.push(order);
//     }

//     // ✅ Calculate discount values
//     const discounting_price = calculatedTotalPrice - discounted_price;
//     const discounting_percentage =
//       (discounting_price / calculatedTotalPrice) * 100;

//     // ✅ Create Bill Entry
//     const bill = await CashierBill.create(
//       {
//         order_no: orderNo,
//         discounted_price,
//         discounting_percentage: discounting_percentage.toFixed(2),
//         discounting_price: discounting_price.toFixed(2),
//         total_price: calculatedTotalPrice.toFixed(2),
//       },
//       { transaction }
//     );

//     await transaction.commit(); // ✅ Commit transaction

//     res.status(201).json({
//       message: "Order and Bill Created Successfully",
//       order_no: orderNo,
//       // orders: orderEntries,
//       // bill,
//     });
//   } catch (error) {
//     await transaction.rollback(); // ❌ Rollback transaction on error
//     console.error("Error creating order:", error);
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };

// // ✅ Function to retrieve bill details along with order details using order number
// exports.getBillByOrderNo = async (req, res) => {
//   try {
//     const { order_no } = req.params; // Extract order number from request parameters

//     // ✅ Fetch bill details from the database
//     const bill = await CashierBill.findOne({
//       where: { order_no },
//       attributes: [
//         "total_price",
//         "discounted_price",
//         "discounting_percentage",
//         "discounting_price",
//       ],
//     });

//     if (!bill) {
//       return res
//         .status(404)
//         .json({ message: "Bill not found for this order number." });
//     }

//     // ✅ Fetch all orders related to the order number
//     const orders = await CashierOrder.findAll({
//       where: { order_no },
//       attributes: [
//         "order_no",
//         "ordered_total_price",
//         "price_id",
//         "customer_id",
//         "ordered_quantity",
//         "date",
//       ],
//     });

//     return res.json({
//       message: "Bill and Order details retrieved successfully",
//       bill,
//       orders, // Include orders in response
//     });
//   } catch (error) {
//     console.error("Error fetching bill details:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

const db = require("../models");
const { generateAndSendBill } = require("../services/billService");
const { sendBillLink } = require("../services/smsService");
const { checkLowStock } = require("./notificationController");
const nodemailer = require("nodemailer");

// Models
const CashierOrder = db.CashierOrder;
const CashierBill = db.CashierBill;
const CashierPrice = db.CashierPrice;
const Customer = db.Customer; // ✅ Use fixed Customer model
const CashierProduct = db.CashierProduct;
const BusinessDetail = db.BusinessDetail;

// Email transporter
const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS,
  },
});

// Test database connection
db.sequelize
  .authenticate()
  .then(() => console.log("✅ Database connected"))
  .catch((err) => console.error("❌ Database connection failed:", err));

// -------------------------------
// Create Order
// -------------------------------
// exports.createOrder = async (req, res) => {
//   const { customer_id, discounted_price, products, send_email } = req.body;

//     // 🔍 DEBUG - Add these lines at the very start
//   console.log('=== DEBUG INFO ===');
//   console.log('Available models:', Object.keys(db));
//   console.log('Customer model exists?', !!db.Customer);
//   console.log('Customer model:', db.Customer?.name);
//   console.log('Customer table name:', db.Customer?.tableName);
//   console.log('customer_id from request:', customer_id);
//   console.log('==================');

//   const transaction = await db.sequelize.transaction();
//   try {
//     console.log("Looking for customer_id:", customer_id);
//     console.log("Using model:", Customer.tableName);

//     const customer = await Customer.findByPk(customer_id);
//     console.log("Customer found:", customer);

//     if (!customer) {
//       await transaction.rollback();
//       return res.status(400).json({ message: "Customer not found" });
//     }
//     // ... rest of code

//     const orderNo = `ORD-${Date.now()}`;
//     const currentDate = new Date();
//     let totalPrice = 0;
//     const orderEntries = [];

//     for (const product of products) {
//       const price = await CashierPrice.findByPk(product.price_id);
//       if (!price) {
//         await transaction.rollback();
//         return res
//           .status(400)
//           .json({
//             message: `Price not found for price_id: ${product.price_id}`,
//           });
//       }

//       const orderedTotalPrice = price.selling_price * product.ordered_quantity;
//       totalPrice += orderedTotalPrice;

//       const order = await CashierOrder.create(
//         {
//           order_no: orderNo,
//           price_id: product.price_id,
//           customer_id,
//           ordered_quantity: product.ordered_quantity,
//           ordered_total_price: orderedTotalPrice,
//           date: currentDate,
//         },
//         { transaction }
//       );

//       orderEntries.push(order);
//     }

//     const discountAmount = totalPrice - discounted_price;
//     const discountPercentage = (discountAmount / totalPrice) * 100;

//     const bill = await CashierBill.create(
//       {
//         order_no: orderNo,
//         discounted_price,
//         discounting_price: discountAmount.toFixed(2),
//         discounting_percentage: discountPercentage.toFixed(2),
//         total_price: totalPrice.toFixed(2),
//       },
//       { transaction }
//     );

//     await transaction.commit();

//     // Send email if requested
//     if (send_email) {
//       try {
//         const billData = await CashierBill.findOne({
//           where: { order_no: orderNo },
//           include: [
//             {
//               model: CashierOrder,
//               as: "order", // ✅ must match association alias in CashierBill model
//               include: [
//                 {
//                   model: CashierPrice,
//                   as: "price", // ✅ must match alias in CashierOrder
//                   include: [
//                     {
//                       model: CashierProduct,
//                       as: "product",
//                       attributes: ["name"],
//                     },
//                   ],
//                   attributes: ["selling_price"],
//                 },
//                 {
//                   model: Customer,
//                   as: "customer", // ✅ must match alias in CashierOrder
//                   attributes: ["name", "email", "phone_no"],
//                 },
//               ],
//             },
//           ],
//         });

//         const orders = billData.order ? [billData.order] : [];
//         const orderFirst = orders[0] || {};
//         const customerInfo = orderFirst.customer || {};

//         const business = await BusinessDetail.findOne({
//           where: { status: "active" },
//           attributes: ["name", "address"],
//         });

//         const completeBillData = {
//           bill_id: bill.id,
//           order_no: orderNo,
//           discounted_price: parseFloat(bill.discounted_price),
//           discounting_price: parseFloat(bill.discounting_price),
//           discounting_percentage: parseFloat(bill.discounting_percentage),
//           total_price: parseFloat(bill.total_price),
//           order_date: currentDate,
//           customer_name: customerInfo.name || "N/A",
//           customer_phone: customerInfo.phone_no || "N/A",
//           customer_email: customerInfo.email || "N/A",
//           business_name: business?.name || "Your Business",
//           business_address: business?.address || "Your Address",
//           products: orders.map((o) => ({
//             product_name: o.price?.product?.name || "N/A",
//             ordered_quantity: o.ordered_quantity,
//             unit_price: parseFloat(o.price?.selling_price || 0),
//             ordered_total_price: parseFloat(o.ordered_total_price),
//           })),
//         };

//         await generateAndSendBill(emailTransporter, completeBillData);

//         return res.status(201).json({
//           message: "Order Created and Bill Sent Successfully",
//           order_no: orderNo,
//           bill_sent: true,
//         });
//       } catch (err) {
//         console.error("Email sending failed:", err);
//         return res.status(201).json({
//           message: "Order Created Successfully, but email sending failed",
//           order_no: orderNo,
//           bill_sent: false,
//           email_error: err.message,
//         });
//       }
//     }

//     res
//       .status(201)
//       .json({
//         message: "Order and Bill Created Successfully",
//         order_no: orderNo,
//       });
//   } catch (err) {
//     await transaction.rollback();
//     console.error("Error creating order:", err);
//     res.status(500).json({ message: "Server Error", error: err.message });
//   }
// };

exports.createOrder = async (req, res) => {
  const { customer_id, discounted_price, products, send_email, business_name, cashier_name, paid_amount } =
    req.body;

  const transaction = await db.sequelize.transaction();

  try {
    // 🧩 Step 1: Validate business name (from AsyncStorage)
    if (!business_name) {
      await transaction.rollback();
      return res.status(400).json({ message: "Business name is required" });
    }

    // 🧩 Step 2: Generate order number using business name prefix
    const businessPrefix = business_name
      .replace(/\s+/g, "")
      .toUpperCase()
      .substring(0, 5);
    const orderNo = `${business_name}-ORD-${Date.now()}`;
    const currentDate = new Date();

    // 🧩 Step 3: Find customer (Optional)
    let customer = null;
    if (customer_id) {
      customer = await Customer.findByPk(customer_id);
      if (!customer) {
        await transaction.rollback();
        return res.status(400).json({ message: "Customer not found" });
      }
    }

    // 🧩 Step 3.5: Get business and owner details
    const business = await BusinessDetail.findOne({
      where: { name: business_name },
      include: [{
        model: db.OwnerDetail,
        as: 'owner'
      }]
    });

    if (!business || !business.owner) {
      await transaction.rollback();
      return res.status(400).json({ message: "Business or owner details not found" });
    }

    const ownerDetails = business.owner;
    const ownerName = ownerDetails.name || "N/A";
    const ownerPhone = ownerDetails.phone_number || "N/A";
    const businessAddress = business.address || "N/A";

    // 🧩 Step 4: Create orders
    let totalPrice = 0;
    const orderEntries = [];

    for (const product of products) {
      const price = await CashierPrice.findByPk(product.price_id);
      if (!price) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Price not found for price_id: ${product.price_id}`,
        });
      }

      const orderedTotalPrice = price.selling_price * product.ordered_quantity;
      totalPrice += orderedTotalPrice;

      // 🛒 Stock Reduction: Check and reduce quantity
      if (price.quantity < product.ordered_quantity) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Insufficient stock for price_id: ${product.price_id}. Available: ${price.quantity}, Ordered: ${product.ordered_quantity}`,
        });
      }

      await price.update(
        { quantity: price.quantity - product.ordered_quantity },
        { transaction }
      );

      const order = await CashierOrder.create(
        {
          order_no: orderNo,
          price_id: product.price_id,
          customer_id,
          ordered_quantity: product.ordered_quantity,
          ordered_total_price: orderedTotalPrice,
          date: currentDate,
        },
        { transaction }
      );

      orderEntries.push(order);
    }

    // 🧩 Step 5: Calculate discount and bill
    const discountAmount = totalPrice - discounted_price;
    const discountPercentage = (discountAmount / totalPrice) * 100;

    const bill = await CashierBill.create(
      {
        order_no: orderNo,
        cashier_name: cashier_name || "Cashier",
        discounted_price,
        discounting_price: discountAmount.toFixed(2),
        discounting_percentage: discountPercentage.toFixed(2),
        total_price: totalPrice.toFixed(2),
        paid_amount: parseFloat(paid_amount) || parseFloat(discounted_price),  // Default to discounted price if not provided

      },
      { transaction }
    );

    await transaction.commit();

    // 🧩 Step 5.5: Check for low stock and trigger notifications
    if (business && business.id) {
      checkLowStock(business.id).catch(err => console.error("Low stock check failed", err));
    }

    // 🧩 Step 6: Email sending (optional)
    if (send_email) {
      try {
        const billData = await CashierBill.findAll({
          where: { order_no: orderNo },
          include: [
            {
              model: CashierOrder,
              as: "order",
              include: [
                {
                  model: CashierPrice,
                  as: "price",
                  include: [
                    {
                      model: CashierProduct,
                      as: "product",
                      attributes: ["name"],
                    },
                  ],
                  attributes: ["selling_price"],
                },
                {
                  model: Customer,
                  as: "customer",
                  attributes: ["name", "email", "phone_no"],
                },
              ],
            },
          ],
        });

        const orders = billData.flatMap(b => b.order || []);
        const orderFirst = orders[0] || {};
        const customerInfo = orderFirst.customer || {};

        const completeBillData = {
          bill_id: bill.id,
          order_no: orderNo,
          discounted_price: parseFloat(bill.discounted_price),
          discounting_price: parseFloat(bill.discounting_price),
          discounting_percentage: parseFloat(bill.discounting_percentage),
          total_price: parseFloat(bill.total_price),
          order_date: currentDate,
          customer_name: customerInfo.name || "N/A",
          customer_phone: customerInfo.phone_no || "N/A",
          customer_email: customerInfo.email || "",
          business_name: business_name,
          business_address: businessAddress,
          cashier_name: cashier_name || ownerName,
          owner_phone: ownerPhone,
          paid_amount: paid_amount ? parseFloat(paid_amount) : parseFloat(bill.discounted_price),
          products: orders.map((o) => ({
            product_name: o.price?.product?.name || "N/A",
            ordered_quantity: o.ordered_quantity,
            unit_price: parseFloat(o.price?.selling_price || 0),
            ordered_total_price: parseFloat(o.ordered_total_price),
          })),
        };

        // We don't await this to avoid blocking response? Or we do. Original code awaited it implicitly?
        // Actually original code passed it to generateAndSendBill.
        // Let's call it safely.
        // Guard: only attempt email if customer has a valid email address
        const recipientEmail = String(completeBillData.customer_email || '').trim();
        if (recipientEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
          generateAndSendBill(emailTransporter, completeBillData).catch(err => console.error("Email send failed", err));
        } else {
          console.log('Skipping bill email: customer has no valid email address.');
        }
      } catch (err) {
        console.error("Email sending failed:", err);
        // Do not return here, allow SMS to be sent if applicable
      }
    }

    // 🧩 Step 7: Send SMS Bill Link (New)
    if (customer && customer.phone_no) {
      sendBillLink(customer.phone_no, orderNo, business_name)
        .then(res => console.log("SMS result:", res))
        .catch(err => console.error("SMS send failed", err));
    }

    // 🧩 Step 8: Success
    res.status(201).json({
      message: "Order and Bill Created Successfully",
      order_no: orderNo,
      bill_sent: send_email && customer && customer.email, // Reflect if email was attempted
      sms_sent: customer && customer.phone_no, // Reflect if SMS was attempted
    });
  } catch (err) {
    await transaction.rollback();
    console.error("Error creating order:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// -------------------------------
// Get Bill by Order No
// -------------------------------
exports.getBillByOrderNo = async (req, res) => {
  try {
    const { order_no } = req.params;

    // 1️⃣ Fetch the bill
    const bill = await CashierBill.findOne({ where: { order_no } });
    if (!bill) {
      return res.status(404).json({ message: "Bill not found." });
    }

    // 2️⃣ Fetch all orders with price/product (exclude customer)
    const orders = await CashierOrder.findAll({
      where: { order_no },
      include: [
        {
          model: CashierPrice,
          as: "price",
          include: [{ model: CashierProduct, as: "product" }],
        },
      ],
    });



    // 3️⃣ Fetch the customer separately (all orders belong to same customer)
    const firstOrder = await CashierOrder.findOne({
      where: { order_no },
      include: [{ model: Customer, as: "customer" }],
    });
    const customer = firstOrder ? firstOrder.customer : null;

    return res.json({
      message: "Bill and Order details retrieved successfully",
      bill,
      customer,    // single customer object for the whole bill
      orders,      // orders with price/product only, no repeated customer
    });
  } catch (err) {
    console.error("Error fetching bill:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// -------------------------------
// Resend Bill Email
// -------------------------------
exports.resendBillEmail = async (req, res) => {
  try {
    const { order_no } = req.params;

    const billData = await CashierBill.findAll({
      where: { order_no },
      include: [
        {
          model: CashierOrder,
          as: "order",
          include: [
            {
              model: CashierPrice,
              as: "price",
              include: [
                { model: CashierProduct, as: "product", attributes: ["name"] },
              ],
            },
            {
              model: Customer,
              as: "customer",
              attributes: ["name", "email", "phone_no"],
            },
          ],
        },
      ],
    });

    if (!billData) return res.status(404).json({ message: "Bill not found" });

    const orders = billData.order ? [billData.order] : [];
    const orderFirst = orders[0] || {};
    const customerInfo = orderFirst.customer || {};

    if (!customerInfo.email)
      return res.status(400).json({ message: "Customer email not found" });

    const business = await BusinessDetail.findOne({
      where: { status: "active" },
      attributes: ["name", "address"],
    });

    const completeBillData = {
      bill_id: billData.id,
      order_no: billData.order_no,
      discounted_price: parseFloat(billData.discounted_price),
      discounting_percentage: parseFloat(billData.discounting_percentage),
      discounting_price: parseFloat(billData.discounting_price),
      total_price: parseFloat(billData.total_price),
      order_date: orderFirst.date,
      customer_name: customerInfo.name || "N/A",
      customer_phone: customerInfo.phone_no || "N/A",
      customer_email: customerInfo.email || "N/A",
      business_name: business?.name || "Your Business",
      business_address: business?.address || "Your Address",
      products: orders.map((o) => ({
        product_name: o.price?.product?.name || "N/A",
        ordered_quantity: o.ordered_quantity,
        unit_price: parseFloat(o.price?.selling_price || 0),
        ordered_total_price: parseFloat(o.ordered_total_price),
      })),
    };

    await generateAndSendBill(emailTransporter, completeBillData);

    res.status(200).json({ message: "Bill sent successfully", order_no });
  } catch (err) {
    console.error("Error resending bill:", err);
    res
      .status(500)
      .json({ message: "Failed to send bill", error: err.message });
  }
};
