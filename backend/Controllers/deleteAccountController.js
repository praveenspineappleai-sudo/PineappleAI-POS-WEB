// Delete Account Controller
// Handles full account deletion with cascading deletes

const {
  sequelize,
  User,
  OwnerDetail,
  BusinessDetail,
  CashierDetail,
  Product,
  Price,
  Barcode,
  Product_Category,
  Order,
  Customer,
  Category,
  Color,
  Size,
  AccessKey,
  Otp,
} = require("../models");
const { Op } = require("sequelize");

const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// -------------------- DELETE ACCOUNT --------------------
exports.deleteAccount = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { password } = req.body;
    const userId = req.user?.userId; // Auth middleware

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in.",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required.",
      });
    }

    // Fetch user
    const user = await User.findByPk(userId);

    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Only owners can delete entire business
    if (user.role !== "owner") {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: "Only owners can delete the account.",
      });
    }

    // Verify password
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Incorrect password.",
      });
    }

    // Fetch owner + business
    const ownerDetail = await OwnerDetail.findOne({
      where: { user_id: userId },
      include: [{ model: BusinessDetail, as: "businessDetail" }],
      transaction,
    });

    if (!ownerDetail) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Owner details not found.",
      });
    }

    const business = ownerDetail.businessDetail;
    const businessId = business?.id;
    const businessName = business?.name;
    const ownerId = ownerDetail.id;
    const userEmail = user.email;

    console.log(`🔴 Deleting account for owner ${ownerId}, business ${businessId}`);

    // -------------------- CASCADE DELETE --------------------

    if (businessId && businessName) {
      // 1. Manual Cascade Delete for Products and related data
      
      // A. Find all products for this business
      const products = await Product.findAll({
        attributes: ["id"],
        where: {
          name: {
            [Op.like]: `${businessName}.%`,
          },
        },
        transaction,
      });

      const productIds = products.map((p) => p.id);

      if (productIds.length > 0) {
        // B. Find all prices for these products to get barcode_ids and for order deletion
        const prices = await Price.findAll({
          attributes: ["id", "barcode_id"],
          where: { product_id: productIds },
          transaction,
        });

        const priceIds = prices.map((p) => p.id);
        const barcodeIds = prices.map((p) => p.barcode_id).filter((id) => id); // Filter nulls

        if (priceIds.length > 0) {
          // C. Find Orders linked to these prices
          const orders = await Order.findAll({
            attributes: ["id", "order_no"],
            where: { price_id: priceIds },
            transaction,
          });

          const orderIds = orders.map((o) => o.id);
          const orderNos = orders.map((o) => o.order_no);

          // D. Delete Bills (linked by order_no)
          // Note: Assuming Bill model exists and is named 'Bill' or table 'bills'
          // If Bill model is not imported, use raw query
          if (orderNos.length > 0) {
             await sequelize.query(
              "DELETE FROM bills WHERE order_no IN (?)",
              {
                replacements: [orderNos],
                transaction,
              }
            );
          }

          // E. Delete Orders
          if (orderIds.length > 0) {
            await Order.destroy({
              where: { id: orderIds },
              transaction,
            });
          }

          // F. Delete Prices
          await Price.destroy({
            where: { id: priceIds },
            transaction,
          });
        }

        // G. Delete Barcodes
        if (barcodeIds.length > 0) {
          await Barcode.destroy({
            where: { id: barcodeIds },
            transaction,
          });
        }

        // H. Delete Product Categories (Junction table)
        await Product_Category.destroy({
          where: { product_id: productIds },
          transaction,
        });

        // I. Finally, Delete Products
        await Product.destroy({
          where: { id: productIds },
          transaction,
        });
      }

      // 2. Delete Notifications
      await sequelize.query(
        "DELETE FROM notifications WHERE business_id = ?",
        {
          replacements: [businessId],
          transaction,
        }
      );

      // 3. Delete Access Keys
      await AccessKey.destroy({
        where: { business_details_id: businessId },
        transaction,
      });
    }

    // 4. Delete Cashiers (User + Detail)
    const cashiers = await CashierDetail.findAll({
      where: { owner_id: ownerId },
      transaction,
    });

    for (const cashier of cashiers) {
      await User.destroy({
        where: { id: cashier.user_id },
        transaction,
      });

      await cashier.destroy({ transaction });
    }

    // 5. Delete OTPs
    await Otp.destroy({
      where: { target: userEmail },
      transaction,
    });

    // 6. Delete Business Detail
    if (businessId) {
      await BusinessDetail.destroy({
        where: { id: businessId },
        transaction,
      });
    }

    // 7. Delete Owner Detail
    await OwnerDetail.destroy({
      where: { id: ownerId },
      transaction,
    });

    // 8. Delete Main User Account
    await User.destroy({
      where: { id: userId },
      transaction,
    });

    // Commit transaction
    await transaction.commit();

    console.log("✅ Account deletion completed");

    // Send Confirmation Email
    transporter
      .sendMail({
        from: `"PAIPOS" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: "Your PAIPOS Account Has Been Deleted",
        html: `
        <h2 style="color: #E74C3C;">Account Deleted</h2>
        <p>Your account and all related business data have been removed permanently.</p>
        <p>This includes:</p>
        <ul>
          <li>Products</li>
          <li>Customers</li>
          <li>Orders</li>
          <li>Cashier accounts</li>
          <li>Business information</li>
        </ul>
        <p><b>This action cannot be undone.</b></p>
      `,
      })
      .catch((err) => console.log("Email error:", err));

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully.",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Delete account error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete account.",
    });
  }
};
