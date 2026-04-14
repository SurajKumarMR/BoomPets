const mongoSanitize = require('express-mongo-sanitize');

// Sanitize user input to prevent NoSQL injection
const sanitizeInput = (req, res, next) => {
  // Remove any keys that start with $ or contain .
  mongoSanitize.sanitize(req.body, {
    replaceWith: '_',
  });
  
  mongoSanitize.sanitize(req.params, {
    replaceWith: '_',
  });
  
  mongoSanitize.sanitize(req.query, {
    replaceWith: '_',
  });
  
  next();
};

module.exports = sanitizeInput;
