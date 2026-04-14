// Security configuration constants
module.exports = {
  // JWT Configuration
  JWT_EXPIRY: '7d',
  JWT_ALGORITHM: 'HS256',
  
  // Password Requirements
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBER: true,
  PASSWORD_REQUIRE_SPECIAL: true,
  
  // Bcrypt Configuration
  BCRYPT_ROUNDS: 12,
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  AUTH_RATE_LIMIT_MAX: 5,
  
  // Request Size Limits
  MAX_REQUEST_SIZE: '10mb',
  
  // CORS
  ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  
  // Session Configuration
  SESSION_TIMEOUT: 7 * 24 * 60 * 60 * 1000, // 7 days
  
  // Security Headers
  HSTS_MAX_AGE: 31536000, // 1 year
  
  // Input Validation
  MAX_STRING_LENGTH: 1000,
  MAX_ARRAY_LENGTH: 100,
};
