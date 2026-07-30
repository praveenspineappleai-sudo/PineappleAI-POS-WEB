const { sequelize, BusinessDetail, Category, Color, Size, Barcode } = require('./models');
const axios = require('axios');
const BASE_URL = 'http://pos-web-dev.pineappleai.cloud/api';

async function verify() {
  try {
    await sequelize.authenticate();
    console.log("DB Connected.");

    // 1. Get dependencies (pick first available)

    // Business
    const businesses = await BusinessDetail.findAll({ limit: 1 });
    if (!businesses.length) throw new Error("No Business found in DB. Please seed the DB.");
    const businessId = businesses[0].id;
    console.log("Using Business ID:", businessId);

    // Category
    const categories = await Category.findAll({ limit: 1 });
    if (!categories.length) throw new Error("No Category found in DB. Please seed the DB.");
    const categoryId = categories[0].id;
    console.log("Using Category ID:", categoryId);

    // Color
    const colors = await Color.findAll({ limit: 1 });
    if (!colors.length) throw new Error("No Color found in DB. Please seed the DB.");
    const colorId = colors[0].id;

    // Size
    const sizes = await Size.findAll({ limit: 1 });
    if (!sizes.length) throw new Error("No Size found in DB. Please seed the DB.");
    const sizeId = sizes[0].id;

    // 2. Create Product via API
    const productPayload = {
      name: `Tests_${Date.now()}`,
      description: "Test Desc",
      categorys_id: categoryId,
      business_id: businessId
    };

    console.log("Creating Product via API...");
    const prodRes = await axios.post(`${BASE_URL}/products/add-product`, productPayload);
    const productId = prodRes.data.product_id;
    console.log("Product Created:", productId);

    // 3. Add Pricing via API with MANUAL BARCODE
    const manualBarcode = `MANUAL_${Date.now()}`;
    const pricingPayload = {
      product_id: productId,
      variations: [
        {
          color_id: colorId,
          size_id: sizeId,
          quantity: 10,
          cost_price: 100,
          selling_price: 150,
          barcode: manualBarcode
        }
      ]
    };

    console.log(`Adding Pricing with barcode ${manualBarcode}...`);
    const priceRes = await axios.post(`${BASE_URL}/products/add-pricing`, pricingPayload);
    console.log("Pricing Added:", priceRes.data);

    // 4. Verify DB
    const barcodeEntry = await Barcode.findOne({ where: { barcode_no: manualBarcode } });
    if (barcodeEntry) {
      console.log("SUCCESS: Barcode found in DB:", barcodeEntry.toJSON());
    } else {
      console.error("FAILURE: Barcode not found in DB.");
    }

  } catch (error) {
    if (error.response) {
      console.error("API Error:", error.response.status, error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  } finally {
    await sequelize.close();
  }
}

verify();
