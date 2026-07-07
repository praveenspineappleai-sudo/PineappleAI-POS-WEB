const { Op, fn, col, literal } = require("sequelize");
const db = require("../models");

const Bill = db.Bill;
const Order = db.Order;
const Customer = db.Customer;
const Price = db.Price;
const Product = db.Product;

exports.getDashboardStats = async (req, res) => {
  try {
    const { business_name } = req.query;

    if (!business_name) {
      return res.status(400).json({ error: "Business name is required" });
    }

    // Filter for all orders by business name (no date range - entire history)
    const businessFilter = {
      order_no: { [Op.like]: `${business_name}-%` },
    };

    // 1. Total Orders (all time)
    const totalOrders = await Order.count({ where: businessFilter });

    // 2. Total Sales (all time)
    const totalSales =
      (await Bill.sum("discounted_price", {
        where: {
          order_no: { [Op.like]: `${business_name}-%` },
        },
      })) || 0;

    // 3. Total Customers (all time)
    // Count distinct customers who have placed orders for this business
    const customerOrders = await Order.findAll({
      attributes: [[fn("DISTINCT", col("customer_id")), "customer_id"]],
      where: businessFilter,
      raw: true,
    });
    const totalCustomers = customerOrders.filter(
      (c) => c.customer_id !== null
    ).length;

    // 4. Calculate Total Profit (all time)
    const allOrders = await Order.findAll({
      attributes: [
        "order_no",
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
    allOrders.forEach((order) => {
      const discountedPrice = parseFloat(order.discounted_price || 0);
      const totalCost = parseFloat(order.total_cost || 0);
      totalProfit += discountedPrice - totalCost;
    });

    // 5. Monthly Sales for the last 6 months
    const monthlySales = [];
    const currentDate = new Date();

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const startDate = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth(),
        1
      );
      const endDate = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth() + 1,
        0
      );

      startDate.setUTCHours(0, 0, 0, 0);
      endDate.setUTCHours(23, 59, 59, 999);

      const monthSales =
        (await Bill.sum("discounted_price", {
          where: {
            order_no: { [Op.like]: `${business_name}-%` },
            created_at: { [Op.between]: [startDate, endDate] },
          },
        })) || 0;

      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      monthlySales.push({
        month: monthNames[monthDate.getMonth()],
        sales: parseFloat(monthSales.toFixed(2)),
      });
    }

    // 6. Top 5 Products by sales
    // Orders link to Price, which links to Product
    const topProductsData = await Order.findAll({
      attributes: [
        [col("Price.product_id"), "product_id"],
        [fn("SUM", col("ordered_quantity")), "total_quantity"],
        [fn("SUM", col("ordered_total_price")), "total_sales"],
      ],
      include: [
        {
          model: Price,
          attributes: [],
          required: true,
        },
      ],
      where: businessFilter,
      group: [col("Price.product_id")],
      order: [[fn("SUM", col("ordered_total_price")), "DESC"]],
      limit: 5,
      raw: true,
    });

    // Get product names for top products and remove business prefix
    const prefix = business_name + ".";
    const topProducts = await Promise.all(
      topProductsData.map(async (item) => {
        try {
          const product = await Product.findOne({
            where: { id: item.product_id }, // Use 'id' not 'product_id'
            attributes: ["name"], // Correct column name is 'name'
          });

          let productName = product
            ? product.name
            : `Product ${item.product_id}`;

          // Remove business prefix if it exists
          if (productName.startsWith(prefix)) {
            productName = productName.replace(prefix, "");
          }

          return {
            name: productName,
            sales: parseFloat(item.total_sales || 0),
          };
        } catch (err) {
          // Fallback if product not found
          return {
            name: `Product ${item.product_id}`,
            sales: parseFloat(item.total_sales || 0),
          };
        }
      })
    );

    // If less than 5 products, add "Others" category if there's remaining sales
    if (topProducts.length > 0 && topProducts.length < 5) {
      const totalTopSales = topProducts.reduce((sum, p) => sum + p.sales, 0);
      const othersSales = Math.max(0, totalSales - totalTopSales);

      if (othersSales > 0) {
        topProducts.push({
          name: "Others",
          sales: parseFloat(othersSales.toFixed(2)),
        });
      }
    }

    res.json({
      totalSales: parseFloat(totalSales.toFixed(2)),
      totalOrders,
      totalCustomers,
      totalProfit: parseFloat(totalProfit.toFixed(2)),
      monthlySales,
      topProducts,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};
