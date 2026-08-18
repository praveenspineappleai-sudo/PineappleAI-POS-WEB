// developed by sabisan
// const { Op, fn, col, literal } = require("sequelize");
// const db = require("../models");
// const { Parser } = require("json2csv");
// const fs = require("fs");
// const path = require("path");
// const os = require("os");

// const Bill = db.Bill;
// const Order = db.Order;
// const Customer = db.Customer;
// const Price = db.Price;

// const getDateRange = (period, startDateInput, endDateInput, monthInput) => {
//   if (startDateInput && endDateInput) {
//     const startDate = new Date(startDateInput);
//     const endDate = new Date(endDateInput);

//     if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
//       throw new Error("Invalid startDate or endDate format. Use YYYY-MM-DD.");
//     }
//     if (startDate > endDate) {
//       throw new Error("startDate must be before endDate.");
//     }

//     startDate.setUTCHours(0, 0, 0, 0);
//     endDate.setUTCHours(23, 59, 59, 999);
//     return { startDate, endDate, period: "custom" };
//   }

//   if (monthInput) {
//     const [year, month] = monthInput.split("-").map(Number);
//     if (!year || !month || month < 1 || month > 12) {
//       throw new Error("Invalid month format. Use YYYY-MM.");
//     }
//     const startDate = new Date(Date.UTC(year, month - 1, 1));
//     const endDate = new Date(Date.UTC(year, month, 0));
//     startDate.setUTCHours(0, 0, 0, 0);
//     endDate.setUTCHours(23, 59, 59, 999);
//     return { startDate, endDate, period: "monthly" };
//   }

//   const today = new Date();
//   let startDate, endDate;

//   if (period === "daily") {
//     startDate = new Date(today);
//     endDate = new Date(today);
//     startDate.setUTCHours(0, 0, 0, 0);
//     endDate.setUTCHours(23, 59, 59, 999);
//   } else if (period === "weekly") {
//     const firstDayOfWeek = today.getDate() - today.getDay();
//     startDate = new Date(today);
//     startDate.setDate(firstDayOfWeek);
//     startDate.setUTCHours(0, 0, 0, 0);
//     endDate = new Date(today);
//     endDate.setDate(firstDayOfWeek + 6);
//     endDate.setUTCHours(23, 59, 59, 999);
//   } else if (period === "monthly") {
//     startDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1));
//     endDate = new Date(Date.UTC(today.getFullYear(), today.getMonth() + 1, 0));
//     startDate.setUTCHours(0, 0, 0, 0);
//     endDate.setUTCHours(23, 59, 59, 999);
//   } else {
//     throw new Error("Invalid period. Use daily, weekly, or monthly.");
//   }

//   return { startDate, endDate, period };
// };

// exports.getSalesStats = async (req, res) => {
//   try {
//     const { period, startDate, endDate, month } = req.query;

//     if (
//       period &&
//       !["daily", "weekly", "monthly"].includes(period) &&
//       !(startDate && endDate) &&
//       !month
//     ) {
//       return res.status(400).json({
//         error:
//           "Invalid period. Use daily, weekly, monthly, or provide startDate and endDate, or month.",
//       });
//     }

//     const { startDate: rangeStart, endDate: rangeEnd, period: finalPeriod } =
//       getDateRange(period, startDate, endDate, month);

//     // Total Orders
//     const totalOrders = await Order.count({
//       where: { created_at: { [Op.between]: [rangeStart, rangeEnd] } },
//     });

//     // Total Sales
//     const totalSales =
//       (await Bill.sum("discounted_price", {
//         where: { created_at: { [Op.between]: [rangeStart, rangeEnd] } },
//       })) || 0;

//     // New Customers
//     const newCustomers = await Customer.count({
//       where: { created_at: { [Op.between]: [rangeStart, rangeEnd] } },
//     });

//     // Order details with fix
//     const salesStats = await Order.findAll({
//       attributes: [
//         "order_no",
//         [fn("SUM", col("ordered_total_price")), "total_price"],
//         [fn("SUM", col("ordered_quantity")), "total_quantity"],
//         [
//           fn("SUM", literal("ordered_quantity * Price.cost_price")),
//           "total_cost",
//         ],
//         [fn("MAX", col("Bill.discounted_price")), "discounted_price"],
//       ],
//       include: [
//         { model: Price, attributes: [] },
//         { model: Bill, attributes: [], required: true }, // FIX: no direct discounted_price here
//       ],
//       where: { created_at: { [Op.between]: [rangeStart, rangeEnd] } },
//       group: ["order_no"],
//       raw: true,
//     });

//     // Calculate total profit
//     let totalProfit = 0;
//     salesStats.forEach((order) => {
//       const discountedPrice = parseFloat(order.discounted_price || 0);
//       const totalCost = parseFloat(order.total_cost || 0);
//       totalProfit += discountedPrice - totalCost;
//     });

//     res.json({
//       period: finalPeriod,
//       totalOrders,
//       totalSales,
//       newCustomers,
//       totalProfit,
//       orderDetails: salesStats,
//     });
//   } catch (error) {
//     console.error("Error fetching sales stats:", error);
//     res.status(500).json({ error: error.message || "Internal server error" });
//   }
// };

// exports.downloadSalesStatsCSV = async (req, res) => {
//   try {
//     const { period, startDate, endDate, month } = req.query;

//     if (
//       period &&
//       !["daily", "weekly", "monthly"].includes(period) &&
//       !(startDate && endDate) &&
//       !month
//     ) {
//       return res.status(400).json({
//         error:
//           "Invalid period. Use daily, weekly, monthly, or provide startDate and endDate, or month.",
//       });
//     }

//     const { startDate: rangeStart, endDate: rangeEnd, period: finalPeriod } =
//       getDateRange(period, startDate, endDate, month);

//     const totalOrders = await Order.count({
//       where: { created_at: { [Op.between]: [rangeStart, rangeEnd] } },
//     });

//     const totalSales =
//       (await Bill.sum("discounted_price", {
//         where: { created_at: { [Op.between]: [rangeStart, rangeEnd] } },
//       })) || 0;

//     const newCustomers = await Customer.count({
//       where: { created_at: { [Op.between]: [rangeStart, rangeEnd] } },
//     });

//     // Order details with fix
//     const salesStats = await Order.findAll({
//       attributes: [
//         "order_no",
//         [fn("SUM", col("ordered_total_price")), "total_price"],
//         [fn("SUM", col("ordered_quantity")), "total_quantity"],
//         [
//           fn("SUM", literal("ordered_quantity * Price.cost_price")),
//           "total_cost",
//         ],
//         [fn("MAX", col("Bill.discounted_price")), "discounted_price"],
//       ],
//       include: [
//         { model: Price, attributes: [] },
//         { model: Bill, attributes: [], required: true }, // FIX applied
//       ],
//       where: { created_at: { [Op.between]: [rangeStart, rangeEnd] } },
//       group: ["order_no"],
//       raw: true,
//     });

//     let totalProfit = 0;
//     const orderDetailsWithProfit = salesStats.map((order) => {
//       const discountedPrice = parseFloat(order.discounted_price || 0);
//       const totalCost = parseFloat(order.total_cost || 0);
//       const profit = discountedPrice - totalCost;
//       totalProfit += profit;
//       return {
//         order_no: order.order_no,
//         total_price: order.total_price,
//         total_quantity: order.total_quantity,
//         total_cost: order.total_cost,
//         discounted_price: order.discounted_price,
//         profit: profit.toFixed(2),
//       };
//     });

//     const summaryData = [
//       {
//         Period: finalPeriod,
//         "Start Date": rangeStart.toISOString().split("T")[0],
//         "End Date": rangeEnd.toISOString().split("T")[0],
//         "Total Orders": totalOrders,
//         "Total Sales": totalSales.toFixed(2),
//         "New Customers": newCustomers,
//         "Total Profit": totalProfit.toFixed(2),
//       },
//     ];

//     const summaryFields = [
//       "Period",
//       "Start Date",
//       "End Date",
//       "Total Orders",
//       "Total Sales",
//       "New Customers",
//       "Total Profit",
//     ];
//     const orderFields = [
//       "order_no",
//       "total_price",
//       "total_quantity",
//       "total_cost",
//       "discounted_price",
//       "profit",
//     ];

//     const json2csvParser = new Parser({ fields: summaryFields });
//     const summaryCSV = json2csvParser.parse(summaryData);

//     const orderJson2csvParser = new Parser({ fields: orderFields });
//     const orderCSV = orderJson2csvParser.parse(orderDetailsWithProfit);

//     const csvContent = `${summaryCSV}\n\nOrder Details\n${orderCSV}`;

//     const fileName = `sales_stats_${finalPeriod}_${
//       rangeStart.toISOString().split("T")[0]
//     }_to_${rangeEnd.toISOString().split("T")[0]}.csv`;
//     const filePath = path.join(os.homedir(), "csv_downloads", fileName);

//     const dir = path.join(os.homedir(), "csv_downloads");
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir, { recursive: true });
//     }

//     fs.writeFileSync(filePath, csvContent);
//     console.log(`CSV saved to: ${filePath}`);

//     res.download(filePath, fileName, (err) => {
//       if (err) {
//         console.error("Error sending file:", err);
//         res.status(500).send("Error downloading file");
//       }
//     });
//   } catch (error) {
//     console.error("Error generating sales stats CSV:", error);
//     res.status(500).json({ error: error.message || "Internal server error" });
//   }
// };

const { Op, fn, col, literal } = require("sequelize");
const db = require("../models");
const { Parser } = require("json2csv");
const fs = require("fs");
const path = require("path");
const os = require("os");

const CashierBill = db.CashierBill;
const CashierOrder = db.CashierOrder;
const Customer = db.Customer;
const CashierPrice = db.CashierPrice;

const normalizePeriod = (period) => {
  if (!period) return "daily";
  if (period === "today") return "daily";
  return period;
};

const getDateRange = (period, startDateInput, endDateInput, monthInput) => {
  const normalizedPeriod = normalizePeriod(period);

  if (startDateInput && endDateInput) {
    const startDate = new Date(startDateInput);
    const endDate = new Date(endDateInput);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error("Invalid startDate or endDate format. Use YYYY-MM-DD.");
    }
    if (startDate > endDate) {
      throw new Error("startDate must be before endDate.");
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    return { startDate, endDate, period: "custom" };
  }

  if (monthInput) {
    const [year, month] = monthInput.split("-").map(Number);
    if (!year || !month || month < 1 || month > 12) {
      throw new Error("Invalid month format. Use YYYY-MM.");
    }
    const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    return { startDate, endDate, period: "monthly" };
  }

  const today = new Date();
  let startDate, endDate;

  if (normalizedPeriod === "daily") {
    startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
  } else if (normalizedPeriod === "weekly") {
    // Past 7 days to today
    startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6, 0, 0, 0, 0);
    endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
  } else if (normalizedPeriod === "monthly") {
    startDate = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
    endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
  } else {
    throw new Error("Invalid period. Use daily, weekly, or monthly.");
  }

  return { startDate, endDate, period: normalizedPeriod };
};

exports.getSalesStats = async (req, res) => {
  try {
    const { period, startDate, endDate, month, business_name } = req.query;

    if (!business_name) {
      return res.status(400).json({ error: "Business name is required" });
    }

    if (
      period &&
      !["daily", "weekly", "monthly", "today"].includes(normalizePeriod(period)) &&
      !(startDate && endDate) &&
      !month
    ) {
      return res.status(400).json({
        error:
          "Invalid period. Use daily, weekly, monthly, or provide startDate and endDate, or month.",
      });
    }

    const {
      startDate: rangeStart,
      endDate: rangeEnd,
      period: finalPeriod,
    } = getDateRange(period, startDate, endDate, month);

    const businessFilter = {
      order_no: { [Op.like]: `${business_name}-%` },
      date: { [Op.between]: [rangeStart, rangeEnd] },
    };

    const salesStats = await CashierOrder.findAll({
      attributes: [
        "order_no",
        [fn("MAX", col("CashierOrder.id")), "id"],
        [fn("MAX", col("customer_id")), "customer_id"],
        [fn("MAX", col("price_id")), "price_id"],
        [fn("MAX", col("date")), "date"],
        [fn("MAX", col("CashierOrder.created_at")), "order_date"],
        [fn("MAX", col("CashierOrder.created_at")), "created_at"],
        [fn("MAX", col("CashierOrder.updated_at")), "updated_at"],
        [fn("SUM", col("ordered_total_price")), "ordered_total_price"],
        [fn("SUM", col("ordered_total_price")), "total_price"],
        [fn("SUM", col("ordered_quantity")), "ordered_quantity"],
        [fn("SUM", col("ordered_quantity")), "total_quantity"],
        [
          fn("SUM", literal("ordered_quantity * price.Cost_price")),
          "total_cost",
        ],
        [fn("MAX", col("bill.discounted_price")), "discounted_price"],
      ],
      include: [
        { model: CashierPrice, as: "price", attributes: [] },
        { model: CashierBill, as: "bill", attributes: [], required: false },
      ],
      where: businessFilter,
      group: ["order_no"],
      order: [[fn("MAX", col("CashierOrder.created_at")), "DESC"], [fn("MAX", col("CashierOrder.id")), "DESC"]],
      raw: true,
    });

    const totalOrders = salesStats.length;
    let totalSales = 0;
    let totalProfit = 0;

    const cleanedSalesStats = salesStats.map((order) => {
      const totalPrice = parseFloat(order.total_price || 0);
      const discountedPrice = order.discounted_price !== null && order.discounted_price !== undefined
        ? parseFloat(order.discounted_price)
        : totalPrice;
      const totalCost = parseFloat(order.total_cost || 0);
      const profit = discountedPrice - totalCost;

      totalSales += discountedPrice;
      totalProfit += profit;

      return {
        ...order,
        id: order.id,
        order_no: order.order_no.replace(/^[^-]+-/, ""),
        full_order_no: order.order_no,
        price_id: order.price_id,
        customer_id: order.customer_id,
        date: order.created_at || order.order_date || order.date,
        order_date: order.created_at || order.order_date || order.date,
        created_at: order.created_at,
        updated_at: order.updated_at,
        ordered_total_price: totalPrice,
        total_price: totalPrice,
        ordered_quantity: parseInt(order.ordered_quantity || 0, 10),
        total_quantity: parseInt(order.total_quantity || 0, 10),
        total_cost: totalCost,
        discounted_price: discountedPrice,

        profit: parseFloat(profit.toFixed(2)),
      };
    });

    const newCustomers = await Customer.count({
      where: { created_at: { [Op.between]: [rangeStart, rangeEnd] } },
    });

    res.json({
      period: finalPeriod,
      totalOrders,
      totalSales: parseFloat(totalSales.toFixed(2)),
      newCustomers,
      totalProfit: parseFloat(totalProfit.toFixed(2)),
      orderDetails: cleanedSalesStats,
    });
  } catch (error) {
    console.error("Error fetching sales stats:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

exports.downloadSalesStatsCSV = async (req, res) => {
  try {
    const { period, startDate, endDate, month, business_name } = req.query;

    if (!business_name) {
      return res.status(400).json({ error: "Business name is required" });
    }

    const {
      startDate: rangeStart,
      endDate: rangeEnd,
      period: finalPeriod,
    } = getDateRange(period, startDate, endDate, month);

    const businessFilter = {
      order_no: { [Op.like]: `${business_name}-%` },
      created_at: { [Op.between]: [rangeStart, rangeEnd] },
    };

    const totalOrders = await Order.count({ where: businessFilter });

    const totalSales =
      (await Bill.sum("discounted_price", { where: businessFilter })) || 0;

    const newCustomers = await Customer.count({
      where: { created_at: { [Op.between]: [rangeStart, rangeEnd] } },
    });

    const salesStats = await Order.findAll({
      attributes: [
        "order_no",
        [fn("MAX", col("CashierOrder.created_at")), "order_date"],
        [fn("SUM", col("ordered_total_price")), "total_price"],
        [fn("SUM", col("ordered_quantity")), "total_quantity"],
        [
          fn("SUM", literal("ordered_quantity * Price.cost_price")),
          "total_cost",
        ],
        [fn("MAX", col("Bill.discounted_price")), "discounted_price"],
      ],
      include: [
        { model: Price, attributes: [] },
        { model: Bill, attributes: [], required: true },
      ],
      where: businessFilter,
      group: ["order_no"],
      raw: true,
    });

    let totalProfit = 0;
    const orderDetailsWithProfit = salesStats.map((order) => {
      const discountedPrice = parseFloat(order.discounted_price || 0);
      const totalCost = parseFloat(order.total_cost || 0);
      const profit = discountedPrice - totalCost;
      totalProfit += profit;

      return {
        order_no: order.order_no.replace(/^[^-]+-/, ""),
        // remove prefix
        order_date: order.order_date,
        total_price: order.total_price,
        total_quantity: order.total_quantity,
        total_cost: order.total_cost,
        discounted_price: order.discounted_price,
        profit: profit.toFixed(2),
      };
    });

    const summaryData = [
      {
        Period: finalPeriod,
        "Start Date": rangeStart.toISOString().split("T")[0],
        "End Date": rangeEnd.toISOString().split("T")[0],
        "Total Orders": totalOrders,
        "Total Sales": totalSales.toFixed(2),
        "New Customers": newCustomers,
        "Total Profit": totalProfit.toFixed(2),
      },
    ];

    const summaryFields = [
      "Period",
      "Start Date",
      "End Date",
      "Total Orders",
      "Total Sales",
      "New Customers",
      "Total Profit",
    ];

    const orderFields = [
      "order_no",
      "order_date",
      "total_price",
      "total_quantity",
      "total_cost",
      "discounted_price",
      "profit",
    ];

    const summaryCSV = new Parser({ fields: summaryFields }).parse(summaryData);
    const orderCSV = new Parser({ fields: orderFields }).parse(
      orderDetailsWithProfit
    );
    const csvContent = `${summaryCSV}\n\nOrder Details\n${orderCSV}`;

    const fileName = `sales_stats_${finalPeriod}_${
      rangeStart.toISOString().split("T")[0]
    }_to_${rangeEnd.toISOString().split("T")[0]}.csv`;
    const filePath = path.join(os.homedir(), "csv_downloads", fileName);

    const dir = path.join(os.homedir(), "csv_downloads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(filePath, csvContent);
    console.log(`CSV saved to: ${filePath}`);

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).send("Error downloading file");
      }
    });
  } catch (error) {
    console.error("Error generating sales stats CSV:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};
