const { sequelize, BusinessDetail, CashierPrice } = require('../models');

async function getBusiness() {
  try {
    const business = await BusinessDetail.findOne();
    const price = await CashierPrice.findOne();
    console.log("Business Name:", business ? business.name : "None");
    console.log("Price ID:", price ? price.id : "None");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

getBusiness();
