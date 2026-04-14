const rateLimit = require('express-rate-limit');

// Skip rate limiting in test environment
const skipRateLimiting = process.env.NODE_ENV === 'test';

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => skipRateLimiting,
});

// Rate limiting for general API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => skipRateLimiting,
});

// Strict rate limiting for sensitive operations
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  message: 'Too many requests for this operation, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => skipRateLimiting,
});

module.exports = {
  authLimiter,
  apiLimiter,
  strictLimiter,
};
