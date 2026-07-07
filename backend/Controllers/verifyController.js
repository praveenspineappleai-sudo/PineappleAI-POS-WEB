

const {
  Otp,
  OwnerDetail,
  User,
  AccessKey,
  BusinessDetail,
} = require("../models");
const nodemailer = require("nodemailer");
const axios = require("axios");
const { Op } = require("sequelize");
// const cron = require("node-cron");

// ------------------- NODEMAILER -------------------
const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS,
  },
});

emailTransporter.verify((error) => {
  if (error) console.error("❌ Email config error:", error.message);
  else console.log("✅ Email server ready");
});

// // ------------------- OTP CLEANUP SCHEDULER -------------------
// // Run cleanup every 2 minutes using cron
// cron.schedule("*/2 * * * *", async () => {
//   try {
//     const deleted = await Otp.destroy({
//       where: {
//         expires_at: {
//           [Op.lt]: new Date(), // Less than current time
//         },
//       },
//     });
//     if (deleted > 0) console.log(`🗑️  Cleaned up ${deleted} expired OTP(s)`);
//   } catch (err) {
//     console.error("❌ OTP cleanup error:", err.message);
//   }
// });

// console.log("✅ OTP cleanup scheduler started (runs every 2 minutes)");

// ------------------- OTP GENERATOR -------------------
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ------------------- PHONE OTP (Notify.lk) -------------------
exports.sendPhoneOtp = async (req, res) => {
  try {
    const { phone_number } = req.body;
    if (!phone_number || !/^\+94[0-9]{9}$/.test(phone_number)) {
      return res.status(400).json({
        message: "Invalid phone number. Use +947XXXXXXX format",
      });
    }

    const owner = await OwnerDetail.findOne({ where: { phone_number } });
    if (owner) return res.status(400).json({ message: "Phone already exists" });

    // Delete any existing OTPs for this phone number
    await Otp.destroy({ where: { target: phone_number, type: "phone" } });

    const code = generateOtp();
    const expires_at = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await Otp.create({ target: phone_number, code, type: "phone", expires_at });

    // Notify.lk API credentials
    const USER_ID = process.env.NOTIFY_USER_ID;
    const API_KEY = process.env.NOTIFY_API_KEY;
    const SENDER_ID = process.env.NOTIFY_SENDER_ID || "NotifyDEMO";

    // Convert phone to 947XXXXXXX format (remove +)
    const formattedPhone = phone_number.replace("+", "");

    // Build API URL
    const url = `https://app.notify.lk/api/v1/send?user_id=${USER_ID}&api_key=${API_KEY}&sender_id=${SENDER_ID}&to=${formattedPhone}&message=${encodeURIComponent(
      `Your verification code is: ${code}. Valid for 5 minutes.`
    )}`;

    // Send GET request to Notify.lk
    const response = await axios.get(url);
    console.log("✅ Notify.lk Response:", response.data);

    res.json({
      message: "OTP sent to your phone",
      ...(process.env.NODE_ENV === "development" && { devCode: code }),
    });
  } catch (err) {
    console.error("❌ Notify.lk error:", err.response?.data || err.message);
    res.status(500).json({
      message: "Failed to send SMS",
      error: err.response?.data || err.message,
    });
  }
};

exports.verifyPhoneOtp = async (req, res) => {
  try {
    const { phone_number, code } = req.body;
    if (!phone_number || !code)
      return res.status(400).json({ message: "Phone and code required" });

    const otpRecord = await Otp.findOne({
      where: { target: phone_number, code, type: "phone" },
    });
    if (!otpRecord) return res.status(400).json({ message: "Invalid OTP" });

    if (otpRecord.expires_at < new Date()) {
      await otpRecord.destroy();
      return res.status(400).json({ message: "OTP expired" });
    }

    await OwnerDetail.update(
      { phone_verified_at: new Date() },
      { where: { phone_number } }
    );
    await otpRecord.destroy();

    res.json({ message: "Phone verified successfully" });
  } catch (err) {
    console.error("❌ Phone verification error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------- EMAIL OTP (Nodemailer) -------------------
exports.sendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email))
      return res.status(400).json({ message: "Invalid email" });

    const user = await User.findOne({ where: { email } });
    if (user) return res.status(400).json({ message: "Email already exists" });

    // Delete any existing OTPs for this email
    await Otp.destroy({ where: { target: email, type: "email" } });

    const code = generateOtp();
    const expires_at = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await Otp.create({ target: email, code, type: "email", expires_at });

    if (process.env.NODE_ENV === "development")
      console.log(`🔐 OTP for ${email}: ${code}`);

    const mailOptions = {
      from: `"PAIPOS" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Email Verification Code",
      html: `
        <h2>Email Verification</h2>
        <p>Your verification code is:</p>
        <h1>${code}</h1>
        <p>Valid for 5 minutes</p>
      `,
    };

    await emailTransporter.sendMail(mailOptions);
    res.json({
      message: "OTP sent to email",
      ...(process.env.NODE_ENV === "development" && { devCode: code }),
    });
  } catch (err) {
    console.error("❌ Email error:", err);
    res
      .status(500)
      .json({ message: "Failed to send email", error: err.message });
  }
};

exports.verifyEmailOtp = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code)
      return res.status(400).json({ message: "Email and code required" });

    const otpRecord = await Otp.findOne({
      where: { target: email, code, type: "email" },
    });
    if (!otpRecord) return res.status(400).json({ message: "Invalid OTP" });

    if (otpRecord.expires_at < new Date()) {
      await otpRecord.destroy();
      return res.status(400).json({ message: "OTP expired" });
    }

    await User.update({ email_verified_at: new Date() }, { where: { email } });
    await otpRecord.destroy();

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("❌ Email verification error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------- CREATE + SEND ACCESS KEY -------------------
exports.createAccessKey = async (req, res) => {
  try {
    const { business_details_id, valid_till } = req.body;

    // Validate business
    if (!business_details_id) {
      return res.status(400).json({ message: "Business ID required" });
    }

    const business = await BusinessDetail.findByPk(business_details_id);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // Generate key
    const newKeyValue =
      "PAI-" + Math.random().toString(36).substring(2, 10).toUpperCase();

    // Store key only
    const accessKey = await AccessKey.create({
      key_value: newKeyValue,
      key_status: "active",
      valid_till: valid_till || new Date(Date.now() + 30 * 86400000),
      business_details_id,
      email_status: "pending",
      created_at: new Date(),
      updated_at: new Date(),
    });

    return res.json({
      message: "Access key created and stored successfully",
      access_key_id: accessKey.id,
      key_value: newKeyValue,
      email_status: "pending",
    });
  } catch (err) {
    console.error("❌ Access key creation error:", err);
    return res.status(500).json({
      message: "Failed to create access key",
      error: err.message,
    });
  }
};


exports.sendAccessKeyEmail = async (req, res) => {
  try {
    const { business_id } = req.body;

    if (!business_id) {
      return res.status(400).json({ message: "Business ID required" });
    }

    // Fetch the latest access key for this business
    const accessKey = await AccessKey.findOne({
      where: { business_details_id: business_id },
      order: [["created_at", "DESC"]],
    });

    if (!accessKey) {
      return res.status(404).json({ message: "Access key not found for this business" });
    }

    // Fetch business
    const business = await BusinessDetail.findByPk(business_id);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // Fetch owner & user email
    const owner = await OwnerDetail.findByPk(business.owner_id);
    const user = await User.findByPk(owner.user_id);

    if (!user || !user.email) {
      return res.status(400).json({ message: "User email not found" });
    }

    // Prepare email
    const mailOptions = {
      from: `"PAIPOS" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Your PAIPOS Access Key",
      html: `
        <h2>PAIPOS Access Key</h2>
        <p><strong>Business:</strong> ${business.name}</p>
        <p><strong>Address:</strong> ${business.address}</p>
        <p><strong>Access Key:</strong> ${accessKey.key_value}</p>
        <p><strong>Valid Till:</strong> ${new Date(accessKey.valid_till).toLocaleString()}</p>
      `,
    };

    // Send email
    await emailTransporter.sendMail(mailOptions);

    await accessKey.update({ email_status: "sent" });

    return res.json({
      message: "Access key email sent successfully",
      sent_to: user.email,
    });
  } catch (err) {
    console.error("❌ Access key email sending error:", err);
    return res.status(500).json({
      message: "Failed to send access key email",
      error: err.message,
    });
  }
};



exports.verifyAccessKey = async (req, res) => {
  try {
    const { key_value } = req.body;

    // ✅ Step 1: Validate input
    if (!key_value) {
      return res.status(400).json({ message: "Access key required" });
    }

    // ✅ Step 2: Find access key in DB
    const accessKey = await AccessKey.findOne({
      where: { key_value },
    });

    if (!accessKey) {
      return res.status(404).json({ message: "Invalid access key" });
    }

    // ✅ Step 3: Check key status
    if (accessKey.key_status !== "active") {
      return res.status(400).json({ message: "Access key is inactive" });
    }

    // ✅ Step 4: Check expiration
    if (new Date(accessKey.valid_till) < new Date()) {
      await accessKey.update({ key_status: "expired" });
      return res.status(400).json({ message: "Access key has expired" });
    }

    // ✅ Step 5: (Optional) fetch business info
    const business = await BusinessDetail.findByPk(
      accessKey.business_details_id
    );

    // ✅ Step 6: Return success
    res.json({
      message: "Access key verified successfully",
      business: business
        ? {
            id: business.id,
            name: business.name,
            address: business.address,
            status: business.status,
          }
        : null,
    });
  } catch (err) {
    console.error("❌ Access key verification error:", err);
    res.status(500).json({
      message: "Failed to verify access key",
      error: err.message,
    });
  }
};
