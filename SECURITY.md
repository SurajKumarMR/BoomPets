# Security Features

BoomPets implements comprehensive security measures to protect user data and prevent common vulnerabilities.

## Implemented Security Features

### 1. Authentication & Authorization
- JWT-based authentication with secure token generation
- Password hashing using bcrypt with 12 salt rounds
- Token expiration (7 days)
- Protected routes requiring valid authentication
- Secure password requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character

### 2. Rate Limiting
- General API rate limiting: 100 requests per 15 minutes
- Authentication endpoints: 5 attempts per 15 minutes
- Prevents brute force attacks and DDoS attempts

### 3. Input Validation & Sanitization
- NoSQL injection prevention using express-mongo-sanitize
- Input sanitization on all routes
- Parameter pollution prevention (HPP)
- Request size limits (10MB max)
- Email format validation
- Required field validation

### 4. Security Headers (Helmet)
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy

### 5. CORS Configuration
- Configurable allowed origins
- Credentials support
- Restricted to specific domains in production

### 6. Data Protection
- Passwords never stored in plain text
- Sensitive data excluded from API responses
- Email addresses normalized (lowercase)
- Timing attack prevention in authentication

### 7. Error Handling
- Centralized error handling middleware
- No sensitive information in error messages
- Proper HTTP status codes
- Detailed logging for debugging (without exposing to clients)

## Environment Variables

Critical security configuration through environment variables:

```bash
# Generate a strong JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Set in .env file
JWT_SECRET=<generated-secret>
ALLOWED_ORIGINS=https://yourdomain.com
NODE_ENV=production
```

## Security Best Practices

### For Development
1. Never commit `.env` files
2. Use `.env.example` as a template
3. Generate unique JWT secrets for each environment
4. Keep dependencies updated: `npm audit fix`

### For Production
1. Set `NODE_ENV=production`
2. Use strong, unique JWT_SECRET (64+ characters)
3. Configure ALLOWED_ORIGINS to your production domains
4. Enable HTTPS/TLS
5. Use environment-specific MongoDB credentials
6. Implement additional monitoring and logging
7. Regular security audits
8. Keep all dependencies updated

## Rate Limiting Configuration

Current limits (configurable in `.env`):

- **General API**: 100 requests / 15 minutes
- **Authentication**: 5 attempts / 15 minutes
- **Sensitive Operations**: 10 requests / hour

## Password Policy

Users must create passwords that meet these requirements:
- Minimum 8 characters
- At least one letter (a-z, A-Z)
- At least one number (0-9)
- At least one special character (!@#$%^&*(),.?":{}|<>)

## Reporting Security Issues

If you discover a security vulnerability, please email security@boompets.com (or create a private security advisory on GitHub).

Do NOT create public issues for security vulnerabilities.

## Security Checklist for Deployment

- [ ] Generate strong JWT_SECRET
- [ ] Configure ALLOWED_ORIGINS for production domains
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS/TLS
- [ ] Configure MongoDB authentication
- [ ] Set up monitoring and alerting
- [ ] Review and adjust rate limits
- [ ] Enable database backups
- [ ] Implement logging strategy
- [ ] Set up firewall rules
- [ ] Review CORS configuration
- [ ] Test authentication flows
- [ ] Run security audit: `npm audit`

## Dependencies

Security-related packages:
- `helmet` - Security headers
- `express-rate-limit` - Rate limiting
- `express-mongo-sanitize` - NoSQL injection prevention
- `hpp` - HTTP parameter pollution prevention
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `express-validator` - Input validation

## Updates

Run regular security audits:

```bash
cd backend
npm audit
npm audit fix
```

Keep dependencies updated:

```bash
npm update
npm outdated
```
