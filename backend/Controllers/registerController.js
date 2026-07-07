// // const User = require('../models/user');
// const { sequelize, User, OwnerDetail, BusinessDetail } = require('../models');
// // const BusinessDetail = require('../models/BusinessDetail');
// const bcrypt = require('bcrypt');
// // const sequelize = require('../config/db');


// exports.register = async (req, res) => {
//   const t = await sequelize.transaction();
//   try {
//     const { email, password, role, name, gender, dob, phone_number, business_name, business_address } = req.body;

//     // Check email/phone duplicates
//     const existingUser = await User.findOne({ where: { email } });
//     const existingOwner = await OwnerDetail.findOne({ where: { phone_number } });
//     if (existingUser || existingOwner) return res.status(400).json({ message: 'Email or phone already exists' });

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create user
//     const user = await User.create({
//       email,
//       password: hashedPassword,
//       role,
//       status: 'active',
//       email_verified_at: new Date() // assuming already verified
//     }, { transaction: t });

//     // Create owner detail
//     const owner = await OwnerDetail.create({
//       name,
//       gender,
//       dob,
//       phone_number,
//       phone_verified_at: new Date(), // assuming already verified
//       user_id: user.id
//     }, { transaction: t });

//     // Create business detail
//     await BusinessDetail.create({
//       name: business_name,
//       address: business_address,
//       owner_id: owner.id
//     }, { transaction: t });

//     await t.commit();
//     res.json({ message: 'Registration successful' });
//   } catch (err) {
//     await t.rollback();
//     console.error(err);
//     res.status(500).json({ message: 'Registration failed' });
//   }
// };



// const { sequelize, User, OwnerDetail, BusinessDetail } = require("../models");
// const bcrypt = require("bcrypt");

// exports.register = async (req, res) => {
//   const t = await sequelize.transaction();
//   try {
//     const {
//       email,
//       password,
//       role,
//       name,
//       gender,
//       dob,
//       phone_number,
//       business_name,
//       business_address,
//     } = req.body;

//     // Check for duplicate email or phone
//     const existingUser = await User.findOne({ where: { email } });
//     const existingOwner = await OwnerDetail.findOne({ where: { phone_number } });
//     if (existingUser || existingOwner) {
//       return res
//         .status(400)
//         .json({ message: "Email or phone number already exists" });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create user
//     const user = await User.create(
//       {
//         email,
//         password: hashedPassword,
//         role,
//         status: "active",
//         email_verified_at: new Date(), // assuming already verified
//       },
//       { transaction: t }
//     );

//     // Create owner detail
//     const owner = await OwnerDetail.create(
//       {
//         name,
//         gender,
//         dob,
//         phone_number,
//         phone_verified_at: new Date(), // assuming already verified
//         user_id: user.id,
//       },
//       { transaction: t }
//     );

//     // Create business detail
//     const business = await BusinessDetail.create(
//       {
//         name: business_name,
//         address: business_address,
//         owner_id: owner.id,
//       },
//       { transaction: t }
//     );

//     await t.commit();

//     // ✅ Send back IDs for further actions (like sending access key)
//     return res.status(200).json({
//       message: "Registration successful",
//       user_id: user.id,
//       owner_id: owner.id,
//       business_id: business.id, // <-- this fixes your issue
//     });
//   } catch (err) {
//     await t.rollback();
//     console.error("❌ Registration error:", err);
//     return res.status(500).json({ message: "Registration failed" });
//   }
// };



const { sequelize, User, OwnerDetail, BusinessDetail } = require("../models");
const bcrypt = require("bcrypt");

exports.register = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      username,
      email,
      password,
      role,
      name,
      gender,
      dob,
      phone_number,
      business_name,
      business_address,
    } = req.body;

    // 🧩 Validate required fields
    if (
      !username ||
      !email ||
      !password ||
      !role ||
      !name ||
      !phone_number ||
      !business_name
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 🧩 Check for duplicates
    const existingUser = await User.findOne({ where: { email } });
    const existingOwner = await OwnerDetail.findOne({ where: { phone_number } });
    if (existingUser || existingOwner) {
      return res
        .status(400)
        .json({ message: "Email or phone number already exists" });
    }

    // 🧩 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🧩 Create user with username
    const user = await User.create(
      {
        username,
        email,
        password: hashedPassword,
        role,
        status: "active",
        email_verified_at: new Date(),
      },
      { transaction: t }
    );

    // 🧩 Create owner detail
    const owner = await OwnerDetail.create(
      {
        name,
        gender,
        dob,
        phone_number,
        phone_verified_at: new Date(),
        user_id: user.id,
      },
      { transaction: t }
    );

    // 🧩 Create business detail
    const business = await BusinessDetail.create(
      {
        name: business_name,
        address: business_address,
        owner_id: owner.id,
      },
      { transaction: t }
    );

    await t.commit();

    return res.status(200).json({
      message: "Registration successful",
      user_id: user.id,
      owner_id: owner.id,
      business_id: business.id,
    });
  } catch (err) {
    await t.rollback();
    console.error("❌ Registration error:", err);
    return res.status(500).json({
      message: "Registration failed",
      error: err.message,
    });
  }
};
