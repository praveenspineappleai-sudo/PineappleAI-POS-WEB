//created by M.Vaishnavi start 25/2 end 28/2

const express = require('express'); // Importing Express framework
const router = express.Router(); // Initializes the router for defining routes
const customerController = require('../Controllers/customerController'); // Import controller functions
const { validateCustomer, validateCustomerUpdate } = require('../validators/customerValidator'); // Import validation functions
const { validate } = require('../middlewares/validateMiddleware'); // Import the validation middleware to handle errors

// Create a new customer with validation
// POST request: /customer
router.post('/create', validateCustomer, validate, customerController.createCustomer);

// Get all customers
// GET request: /customer/get
router.get('/getall', customerController.getCustomers);

// Get one customer by ID
// GET request: /customer/:id
router.get('/get/:id', customerController.getCustomer);

// Update customer (PATCH) with validation
// PATCH request: /customer/update/:id
router.patch('/update/:id', validateCustomerUpdate, validate, customerController.updateCustomer);

// Delete customer
// DELETE request: /customer/delete/:id
router.delete('/delete/:id', customerController.deleteCustomer);

module.exports = router;