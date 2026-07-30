// // developed by sabisan

// const db = require("../models");
// const { Op } = require("sequelize");

// const Product = db.Product;
// const Price = db.Price;
// const Size = db.Size;
// const Color = db.Color;
// const Category = db.Category;

// // -----------------------------
// // Get Products
// // -----------------------------
// exports.getProducts = async (req, res) => {
//   try {
//     const { name, category_id, stock_status } = req.query;

//     // --- Filters ---
//     const productWhere = {};
//     if (name) productWhere.name = { [Op.like]: `%${name}%` };
//     if (category_id) productWhere.categorys_id = category_id;

//     const priceWhere = {};
//     if (stock_status) {
//       if (stock_status === "in_stock") {
//         priceWhere.quantity = { [Op.gte]: 11 };
//       } else if (stock_status === "low_stock") {
//         priceWhere.quantity = { [Op.between]: [1, 10] };
//       } else if (stock_status === "out_of_stock") {
//         priceWhere.quantity = { [Op.eq]: 0 };
//       } else {
//         return res.status(400).json({ error: "Invalid stock status" });
//       }
//     }

//     // --- Query ---
//     const prices = await Price.findAll({
//       where: priceWhere,
//       include: [
//         {
//           model: Product,
//           where: productWhere,
//           required: true,
//           attributes: ["id", "name", "categorys_id", "created_at", "updated_at"],
//           include: [
//             {
//               model: Category,
//               attributes: ["id", "category_name"],
//               required: true,
//             },
//           ],
//         },
//         { model: Size, attributes: ["id", "size"], required: false },
//         { model: Color, attributes: ["id", "colour_name"], required: false },
//       ],
//       order: [[Product, "name", "ASC"]],
//     });

//     if (!prices || prices.length === 0) {
//       return res.status(200).json([]); // return empty list
//     }

//     // --- Format ---
//     const formatted = prices.map((price) => ({
//       id: price.Product?.id || null,
//       name: price.Product?.name || "",
//       categorys_id: price.Product?.categorys_id || null,
//       category_name: price.Product?.Category?.category_name || "",
//       created_at: price.Product?.created_at || null,
//       updated_at: price.Product?.updated_at || null,
//       price_id: price.id,
//       quantity: price.quantity || 0,
//       cost_price: price.cost_price || 0, // ✅ fixed case
//       selling_price: price.selling_price || 0, // ✅ fixed case
//       size: price.Size?.size || null,
//       color: price.Color?.colour_name || null,
//     }));

//     res.status(200).json(formatted);
//   } catch (error) {
//     console.error("Error fetching products:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// // -----------------------------
// // Delete Product
// // -----------------------------
// exports.deleteProduct = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const { id } = req.params;
//     if (!id) {
//       await transaction.rollback();
//       return res.status(400).json({ error: "Price ID is required" });
//     }

//     const price = await Price.findByPk(id, { transaction });
//     if (!price) {
//       await transaction.rollback();
//       return res.status(404).json({ error: "Price record not found" });
//     }

//     const productId = price.product_id;
//     await price.destroy({ transaction });
//     console.log(`✅ Deleted price record: ${id}`);

//     const remaining = await Price.count({
//       where: { product_id: productId },
//       transaction,
//     });

//     if (remaining === 0) {
//       const product = await Product.findByPk(productId, { transaction });
//       if (product) {
//         await product.destroy({ transaction });
//         console.log(`✅ Deleted product: ${productId}`);
//       }
//     }

//     await transaction.commit();
//     res.status(200).json({
//       message: "Product deleted successfully",
//       priceId: id,
//       productId,
//     });
//   } catch (error) {
//     await transaction.rollback();
//     console.error("Error deleting product:", error);
//     res
//       .status(500)
//       .json({ error: `Failed to delete product: ${error.message}` });
//   }
// };

// developed by sabisan (updated for business prefix logic)

const db = require("../models");
const { Op } = require("sequelize");

const Product = db.Product;
const Price = db.Price;
const Size = db.Size;
const Color = db.Color;
const Category = db.Category;
const Barcode = db.Barcode; // ✅ Import Barcode
const BusinessDetail = db.BusinessDetail; // ✅ Import BusinessDetail

// -----------------------------
// Get Products (business-aware)
// -----------------------------
exports.getProducts = async (req, res) => {
  try {
    const { name, category_id, stock_status } = req.query;
    const business_id = req.business_id || req.user?.businessId;

    if (!business_id) {
      return res.status(400).json({ error: "Business ID is required" });
    }

    // Get business details
    const business = await BusinessDetail.findByPk(business_id);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    const prefix = business.name + ".";

    // --- Filters ---
    const productWhere = { name: { [Op.like]: `${prefix}%` } }; // Only products with this business prefix
    if (name) productWhere.name[Op.like] = `${prefix}${name}%`; // search after prefix
    if (category_id) productWhere.categorys_id = category_id;

    const priceWhere = {};
    if (stock_status) {
      if (stock_status === "in_stock") priceWhere.quantity = { [Op.gte]: 11 };
      else if (stock_status === "low_stock")
        priceWhere.quantity = { [Op.between]: [1, 10] };
      else if (stock_status === "out_of_stock")
        priceWhere.quantity = { [Op.eq]: 0 };
      else return res.status(400).json({ error: "Invalid stock status" });
    }

    // --- Query ---
    const prices = await Price.findAll({
      where: priceWhere,
      include: [
        {
          model: Product,
          as: "product",
          where: productWhere,
          required: true,
          attributes: [
            "id",
            "name",
            "description",
            "categorys_id",
            "created_at",
            "updated_at",
          ],
          include: [
            {
              model: Category,
              as: "Category",
              attributes: ["id", "category_name"],
              required: true,
            },
          ],
        },
        { model: Size, as: "Size", attributes: ["id", "size"], required: false },
        { model: Color, as: "Color", attributes: ["id", "colour_name"], required: false },
        { model: Barcode, attributes: ["barcode_no"], required: false, as: "Barcode" }, // ✅ Include Barcode
      ],
      order: [[{ model: Product, as: "product" }, "name", "ASC"]],
    });

    if (!prices || prices.length === 0) return res.status(200).json([]);

    const priceIds = prices.map(p => p.id);
    let customAttrMap = {};
    if (priceIds.length > 0) {
      const rawDb = require("../config/database");
      const [customAttrs] = await rawDb.query(
        'SELECT price_id, attribute_name, attribute_value FROM product_attribute_values WHERE price_id IN (?)',
        [priceIds]
      );
      
      customAttrs.forEach(attr => {
        if (!customAttrMap[attr.price_id]) {
          customAttrMap[attr.price_id] = {};
        }
        const key = attr.attribute_name.toLowerCase().replace(/\s+/g, '_');
        customAttrMap[attr.price_id][key] = attr.attribute_value;
      });
    }

    // --- Format ---
    const formatted = prices.map((price) => {
      let productName = price.product?.name || "";
      if (productName.startsWith(prefix)) {
        productName = productName.replace(prefix, ""); // remove business prefix
      }

      return {
        id: price.product?.id || null,
        name: productName,
        description: price.product?.description || "",
        categorys_id: price.product?.categorys_id || null,
        category_name: price.product?.Category?.category_name || "",
        created_at: price.product?.created_at || null,
        updated_at: price.product?.updated_at || null,
        price_id: price.id,
        quantity: price.quantity || 0,
        cost_price: price.cost_price || 0,
        selling_price: price.selling_price || 0,
        size: price.Size?.size || null,
        color: price.Color?.colour_name || null,
        barcode: price.Barcode?.barcode_no || "", // ✅ Add barcode to response
        customAttributes: customAttrMap[price.id] || {}, // ✅ Add custom attributes
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// -----------------------------
// Delete Product (unchanged, but optional: filter by business)
// -----------------------------
exports.deleteProduct = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { id } = req.params;
    const business_id = req.business_id;

    if (!id) {
      await transaction.rollback();
      return res.status(400).json({ error: "Price ID is required" });
    }

    const price = await Price.findByPk(id, {
      include: [
        {
          model: Product,
          as: "product",
          required: true,
          where: { name: { [Op.like]: `%${business_id}%` } }, // optional filter to prevent cross-business deletion
        },
      ],
      transaction,
    });

    if (!price) {
      await transaction.rollback();
      return res.status(404).json({ error: "Price record not found" });
    }

    const productId = price.product_id;
    await price.destroy({ transaction });
    console.log(`✅ Deleted price record: ${id}`);

    const remaining = await Price.count({
      where: { product_id: productId },
      transaction,
    });

    if (remaining === 0) {
      const product = await Product.findByPk(productId, { transaction });
      if (product) {
        await product.destroy({ transaction });
        console.log(`✅ Deleted product: ${productId}`);
      }
    }

    await transaction.commit();
    res.status(200).json({
      message: "Product deleted successfully",
      priceId: id,
      productId,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error deleting product:", error);
    res
      .status(500)
      .json({ error: `Failed to delete product: ${error.message}` });
  }
};
