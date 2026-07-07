// developed by G.Sabisan start 4/3/2025 to 5/3/2025

// Import the 'Op' object from Sequelize for advanced query operators
const { Op } = require("sequelize");

// Import the database instance from the models folder
const db = require("../models");

// Get the 'Customer' model from the database instance
const Customer = db.Customer;

// Get the 'Order' model from the database instance
const Order = db.Order;

/**
 * Search for customers by name, phone number, or email
 * This function searches for customers whose details match the search query.
 */
exports.searchCustomers = async (req, res) => {
  try {
    // Extract the search query from request parameters
    const { query } = req.query;

    // If no search query is provided, return a 400 error response
    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    // Search for customers whose name, phone number, or email contains the search query
    const customers = await Customer.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${query}%` } }, // Match names containing the query
          { phone_no: { [Op.like]: `%${query}%` } }, // Match phone numbers containing the query
          { email: { [Op.like]: `%${query}%` } }, // Match emails containing the query
        ],
      },
      include: [
        {
          model: Order, // Include the 'Order' model
          as: "orders", // Use alias for the relationship
          attributes: ["ordered_total_price"], // Select only the 'total_price' field from the order
          limit: 1, // Fetch only the first order per customer
        },
      ],
      order: [["name", "ASC"]], // Sort results alphabetically by customer name
    });

    // If no customers match the query, return a 404 response
    if (customers.length === 0) {
      return res.status(404).json({ message: "No customers found" });
    }

    // Format the customer data before sending the response
    const formattedCustomers = customers.map((customer) => {
      return {
        id: customer.id, // Customer ID
        name: customer.name, // Customer Name
        phone_no: customer.phone_no, // Customer Phone Number
        email: customer.email, // Customer Email
        created_at: customer.createdAt, // Timestamp when the record was created
        updated_at: customer.updatedAt, // Timestamp when the record was last updated
        total_price:
          customer.orders.length > 0
            ? customer.orders[0].ordered_total_price
            : null, // Assign first order's total price if available
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
