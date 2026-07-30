const db = require('../models');
const Customer = db.Customer;

// Create a new customer
exports.createCustomer = async (req, res) => {
  try {
    const customerPayload = { ...req.body };

    if (customerPayload.phone_no) {
      const digits = String(customerPayload.phone_no).replace(/\D/g, '');
      customerPayload.phone_no = digits.startsWith('0') && digits.length === 10 ? digits.slice(1) : digits;
    }

    const customer = await Customer.create(customerPayload);
    const customerResponse = customer.toJSON ? customer.toJSON() : customer;

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customerResponse,
    });
  } catch (error) {
    console.error('Error in createCustomer:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get a customer by ID
exports.getCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByPk(id);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    console.error('Error in getCustomer:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all customers
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll();
    res.status(200).json({ success: true, count: customers.length, data: customers });
  } catch (error) {
    console.error('Error in getCustomers:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update a customer
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Customer.update(req.body, { where: { id } });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Customer not found or no update made' });
    }

    const updatedCustomer = await Customer.findByPk(id);
    res.status(200).json({ success: true, message: 'Customer updated successfully', data: updatedCustomer });
  } catch (error) {
    console.error('Error in updateCustomer:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete a customer
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Customer.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.status(200).json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error in deleteCustomer:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};