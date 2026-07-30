// Developed by M.Vaishnavi start 25/2 end 28/2

const { body } = require('express-validator'); // Importing 'body' from 'express-validator' to validate request data

// Customer Name Validation
const validateName = (isCreate = true) => { // Function to validate customer name, with an option for create/update
  let validator = body('name') // Specifies that we're validating the 'customer_name' field
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters.');

  if (isCreate) { // If this is a creation request
    validator = validator.notEmpty().withMessage('Name is required.'); // Ensures the name field is not empty
  }

  return validator; // Returns the validator
};

// Phone Number Validation
const validatePhoneNo = (isCreate = true) => { // Function to validate phone number, with an option for create/update
  let validator = body('phone_no') // Specifies that we're validating the 'customer_phoneno' field
    .trim()
    .notEmpty().withMessage('Phone is required.')
    .matches(/^0?\d{9}$/).withMessage('Enter a valid phone number (9 digits, with or without leading 0).');

  if (isCreate) { // If this is a creation request
    validator = validator.notEmpty().withMessage('Phone is required.'); // Ensures the phone number field is not empty
  }

  return validator; // Returns the validator
};

// Email Validation
const validateEmail = (isCreate = true) => { // Function to validate email, with an option for create/update
  return body('email') // Specifies that we're validating the 'customer_email' field
    .optional({ checkFalsy: true }) // Allows null, undefined, or empty string
    .isEmail().withMessage('Invalid email format.') // Ensures the input is a valid email.
    .isLength({ min: 10, max: 50 }).withMessage('Must be 10-50 chars.'); // Email length must be between 10 and 50 characters.
};

// Validation array for creating a customer
exports.validateCustomer = [
  validateName(true), // Validate name for creating a customer.
  validatePhoneNo(true), // Validate phone number for creating a customer.
  validateEmail(true),  // Validate email for creating a customer.
];

// Validation array for updating a customer
exports.validateCustomerUpdate = [
  validateName(false), // Validate name for updating a customer.
  validatePhoneNo(false), // Validate phone number for updating a customer.
  validateEmail(false), // Validate email for updating a customer.
];
