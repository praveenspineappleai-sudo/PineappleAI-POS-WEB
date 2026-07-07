// // Developed by Janarthan 06/03/2025

// const db = require("../models"); // Import the database models

// // Function to retrieve product details based on a barcode number
// async function getProductDetails(req, res) {
//   try {
//     const { barcodeNo } = req.params; // Extract barcode number from request parameters

//     // Split barcode number into parts (expecting format: "product_id size_id color_id")
//     const parts = barcodeNo.trim().split(/\s+/);
//     if (parts.length !== 3) {
//       return res.status(400).json({
//         error:
//           "Invalid barcode format. Expected format: 'product_id size_id color_id'",
//       });
//     }

//     const [productId, sizeId, colorId] = parts; // Destructure barcode parts

//     // Find the barcode record in the database with associated price and product details
//     const barcodeRecord = await db.CashierBarcode.findOne({
//       where: { barcode_no: barcodeNo }, // Search by barcode number
//       include: [
//         {
//           model: db.CashierPrice, // Include the Price model
//           attributes: ["selling_price", "id"], // Retrieve Selling_price and price ID
//           include: [
//             {
//               model: db.CashierProduct, // Include the Product model inside Price
//               as: 'product', // ✅ Use the correct alias 'product' as defined in the association
//               attributes: ["name", "description"], // Retrieve product details
//             },
//           ],
//         },
//       ],
//     });

//     // If no matching record is found, return an error response
//     if (!barcodeRecord || !barcodeRecord.CashierPrice) {
//       return res
//         .status(404)
//         .json({ message: "No product found for the given barcode number." });
//     }

//     // Extract relevant product details
//     const { id: price_id, selling_price } = barcodeRecord.CashierPrice;
//     const { name, description } =
//       barcodeRecord.CashierPrice.product || {}; // ✅ Access using 'product' alias

//     // Return product details in the response
//     return res.json({
//       price_id, // ✅ Return price_id instead of product_id
//       product_name: name || "Unknown Product",
//       description: description || "No description available",
//       price: parseFloat(selling_price).toFixed(2), // Format price to 2 decimal places
//     });
//   } catch (error) {
//     console.error("Error fetching product details:", error); // Log error for debugging
//     return res.status(500).json({ error: "Internal server error" }); // Return generic error response
//   }
// }

// module.exports = { getProductDetails }; // Export the function for use in other files

const db = require("../models"); // Import the database models

async function getProductDetails(req, res) {
  try {
    const { barcodeNo } = req.params;

    const parts = barcodeNo.trim().split(/\s+/);
    if (parts.length !== 3) {
      return res.status(400).json({
        error:
          "Invalid barcode format. Expected format: 'product_id size_id color_id'",
      });
    }

    const [productId, sizeId, colorId] = parts;

    const barcodeRecord = await db.CashierBarcode.findOne({
      where: { barcode_no: barcodeNo },
      include: [
        {
          model: db.CashierPrice,
          attributes: ["selling_price", "id", "quantity"],
          include: [
            {
              model: db.CashierProduct,
              as: "product",
              attributes: ["name", "description"],
            },
          ],
        },
      ],
    });

    if (!barcodeRecord || !barcodeRecord.CashierPrice) {
      return res
        .status(404)
        .json({ message: "No product found for the given barcode number." });
    }

    const { id: price_id, selling_price, quantity } = barcodeRecord.CashierPrice;
    let { name, description } = barcodeRecord.CashierPrice.product || {};

    // Remove prefix from product name if it contains a dot (e.g., "Smart Mart.ProductName")
    if (name && name.includes(".")) {
      name = name.split(".").slice(1).join("."); // keeps everything after the first dot
    }

    return res.json({
      price_id,
      product_name: name || "Unknown Product",
      description: description || "No description available",
      price: parseFloat(selling_price).toFixed(2),
      quantity: quantity || 0,
    });
  } catch (error) {
    console.error("Error fetching product details:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { getProductDetails };
