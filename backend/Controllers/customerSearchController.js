// developed by G.Sabisan start 4/3/2025 to 5/3/2025

// Import the 'Op' object from Sequelize for advanced query operators
const { Op } = require("sequelize");

// Import the database instance from the models folder
const db = require("../models");

// Get the 'Customer' model from the database instance
const Customer = db.Customer;

// Use the existing order model if available; fall back to the legacy model name.
const OrderModel = db.CashierOrder || db.Order;

/**
 * Search for customers by name, phone number, or email
 * This function searches for customers whose details match the search query.
 */
exports.searchCustomers = async (req, res) => {
  try {
    // Extract the search query from request parameters
    const { query } = req.query;
    const trimmedQuery = String(query || "").trim();

    // If no search query is provided, return a 400 error response
    if (!trimmedQuery) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const searchOptions = {
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${trimmedQuery}%` } },
          { phone_no: { [Op.like]: `%${trimmedQuery}%` } },
          { email: { [Op.like]: `%${trimmedQuery}%` } },
        ],
      },
      order: [["name", "ASC"]],
    };

    if (OrderModel) {
      searchOptions.include = [
        {
          model: OrderModel,
          as: "orders",
          attributes: ["ordered_total_price"],
          limit: 1,
        },
      ];
    }

    // Search for customers whose name, phone number, or email contains the search query
    const customers = await Customer.findAll(searchOptions);

    // Return an empty list for no matches so the UI can render a clean state
    if (customers.length === 0) {
      return res.status(200).json([]);
    }

    // Format the customer data before sending the response
    const formattedCustomers = customers.map((customer) => {
      const orders = Array.isArray(customer.orders) ? customer.orders : [];
      return {
        id: customer.id,
        name: customer.name,
        customerName: customer.name,
        phone_no: customer.phone_no,
        phoneNumber: customer.phone_no,
        email: customer.email,
        created_at: customer.created_at || customer.createdAt,
        updated_at: customer.updated_at || customer.updatedAt,
        total_price: orders.length > 0 ? orders[0].ordered_total_price : null,
      };
    });

    // Send the formatted customer list as a JSON response
    res.json(formattedCustomers);
  } catch (error) {
    // Log the error if the search operation fails
    console.error("Error searching for customers:", error);

    // Send an error response with status code 500 (Internal Server Error)
    res.status(500).json({ error: "Internal server error" });
  }
};
