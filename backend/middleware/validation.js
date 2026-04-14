const mongoose = require('mongoose');

const validateRequiredFields = (fields) => {
  return (req, res, next) => {
    const missing = fields.filter(field => !req.body[field]);
    if (missing.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missing.join(', ')}` 
      });
    }
    next();
  };
};

const validatePositiveNumber = (fields) => {
  return (req, res, next) => {
    for (const field of fields) {
      const value = req.body[field];
      if (value !== undefined) {
        if (typeof value !== 'number' || isNaN(value)) {
          return res.status(400).json({ 
            error: `${field} must be a valid number` 
          });
        }
        if (value <= 0) {
          return res.status(400).json({ 
            error: `${field} must be positive` 
          });
        }
      }
    }
    next();
  };
};

const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    next();
  };
};

const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj.trim().replace(/[<>]/g, '');
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };
  
  req.body = sanitize(req.body);
  next();
};

module.exports = {
  validateRequiredFields,
  validatePositiveNumber,
  validateObjectId,
  sanitizeInput,
};
