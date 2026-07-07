// Developed by M.Vaishnavi | Start: 01/4 | End: 02/4

const { Price, Product, Barcode, Color, Size } = require("../models"); // Import models from database

// Create a new price record
const createPrice = async (req, res) => {
  try {
    const { quantity, barcode_id, product_id, color_id, size_id, cost_price, selling_price } = req.body; // Extract price details from request body

    // Check if referenced product exists
    const product = await Product.findByPk(product_id);
    if (!product) return res.status(404).json({ error: "Product not found" }); // Return error if product is not found

    // Check if referenced barcode exists
    const barcode = await Barcode.findByPk(barcode_id);
    if (!barcode) return res.status(404).json({ error: "Barcode not found" }); // Return error if barcode is not found

    // Check if referenced color exists
    const color = await Color.findByPk(color_id);
    if (!color) return res.status(404).json({ error: "Color not found" }); // Return error if color is not found

    // Check if referenced size exists
    const size = await Size.findByPk(size_id);
    if (!size) return res.status(404).json({ error: "Size not found" }); // Return error if size is not found

    // Create a new price record in the database
    const price = await Price.create({ quantity, barcode_id, product_id, color_id, size_id, cost_price, selling_price });

    res.status(201).json(price); // Respond with the created price data
  } catch (error) {
    console.error("Error creating price:", error); // Log error for debugging
    res.status(500).json({ error: "Failed to create price", details: error.message }); // Return error response
  }
};

// Fetch all price records
const getAllPrices = async (req, res) => {
  try {
    const prices = await Price.findAll({
      include: [
        { model: Barcode, as: 'barcode' }, // Include barcode details
        { model: Product, as: 'product' }, // Include product details
        { model: Color, as: 'color' }, // Include color details
        { model: Size, as: 'size' } // Include size details
      ]
    });

    res.status(200).json(prices); // Respond with all price records
  } catch (error) {
    console.error(error); // Log error for debugging
    res.status(500).json({ error: 'Failed to fetch prices', details: error.message }); // Return error response
  }
};

module.exports = { createPrice, getAllPrices }; // Export controller functions
