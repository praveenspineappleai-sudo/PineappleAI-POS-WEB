const { validationResult } = require('express-validator'); // Import the express-validator to get the validation results

// Middleware to handle validation errors
exports.validate = (req, res, next) => {
  const errors = validationResult(req); // Get validation results from the request.
  if (!errors.isEmpty()) {
     // If there are validation errors, return a 400 error with details of the errors.
    return res.status(400).json({ 
      errors: errors.array().map(err => ({
        path: err.path, // The path of the field
        message: err.msg // The error message
      })) 
    });
  }
  next(); // If there are no validation errors, proceed to the next middleware.
};