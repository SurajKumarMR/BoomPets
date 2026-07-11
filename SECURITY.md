# BoomPets Security Guidelines

## 🔒 Security Overview

This document outlines the security measures implemented in the BoomPets application and provides guidelines for maintaining security.

---

## Security Layers

### 1. HTTP Security Headers

**Location**: `lib/security/headers.ts`

Implemented headers:
- **Strict-Transport-Security**: Enforces HTTPS connections
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME-type sniffing
- **X-XSS-Protection**: Enables browser XSS protection
- **Content-Security-Policy**: Restricts resource loading
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features
- **Cross-Origin policies**: COOP, COEP, CORP

### 2. Input Sanitization

**Location**: `lib/security/sanitize.ts`

Protection against:
- **XSS Attacks**: HTML/JavaScript injection
- **SQL Injection**: Dangerous SQL characters
- **Path Traversal**: Directory access attempts
- **Open Redirects**: URL validation
- **Malicious Patterns**: Script tags, eval, etc.

Functions available:
```typescript
sanitizeHtml(input)       // Escape HTML entities
sanitizeSql(input)        // Remove SQL injection vectors
sanitizeFileName(name)    // Prevent path traversal
sanitizeUrl(url)          // Validate URLs
sanitizeEmail(email)      // Validate email format
sanitizePhone(phone)      // Clean phone numbers
sanitizeUserText(text)    // Remove dangerous content
```

### 3. Authentication & Authorization

**Implementation**: Supabase Auth + Row Level Security

Features:
- Secure session management
- JWT token validation
- Password hashing (bcrypt)
- Email verification
- Password reset flow
- Row Level Security (RLS) on database

**Best Practices**:
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to client
- Always use server-side auth checks for sensitive operations
- Implement RLS policies for all tables
- Use middleware for protected routes

### 4. API Security

**Location**: `lib/security/api-middleware.ts`

Features:
- **Authentication**: `requireAuth()`
- **Rate Limiting**: `withRateLimit()`
- **CORS**: `withCors()`
- **Method Validation**: `requireMethod()`
- **Content-Type Validation**: `requireContentType()`
- **Request Size Limits**: `validateRequestSize()`
- **Signature Validation**: `validateSignature()`

Example usage:
```typescript
export async function POST(request: NextRequest) {
  // Check authentication
  const { error, user } = await requireAuth(request);
  if (error) return error;
  
  // Rate limiting
  const rateLimit = withRateLimit(user.id, 100, 60000);
  if (rateLimit.error) return rateLimit.error;
  
  // Your logic here
}
```

### 5. CSRF Protection

**Location**: `lib/security/csrf.ts`

Implementation:
- Token generation and validation
- Automatic cookie management
- SameSite cookie policy

Usage in forms:
```typescript
const token = await getCsrfToken();
// Include in form as hidden field or header
```

### 6. Password Security

**Location**: `lib/security/password.ts`

Features:
- **Strength Validation**: Scoring system (0-4)
- **Common Password Blocking**: Checks against known weak passwords
- **Breach Checking**: Integration ready for HIBP API
- **Crack Time Estimation**: Shows password strength visually
- **Password Generation**: Strong random password generator

Requirements:
- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number
- At least one special character
- No common patterns or sequences

### 7. Environment Variable Security

**Location**: `lib/security/env-validation.ts`

Features:
- Automatic validation on startup
- Pattern matching for API keys
- Sensitive variable detection
- Placeholder detection
- Production vs development checks

Validation includes:
- ✅ Required variables present
- ✅ Correct format/pattern
- ⚠️ Sensitive variables not exposed
- ⚠️ No placeholder values
- ⚠️ No test keys in production

---

## Security Checklist

### Before Deployment

- [ ] All environment variables configured
- [ ] API keys rotated and secured
- [ ] HTTPS enforced
- [ ] Database RLS policies enabled
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Security headers active
- [ ] Error messages don't expose sensitive info
- [ ] Logging configured (no sensitive data logged)
- [ ] Backup strategy in place

### Regular Maintenance

- [ ] Update dependencies monthly
- [ ] Review security logs weekly
- [ ] Rotate API keys quarterly
- [ ] Audit user permissions monthly
- [ ] Review database access patterns
- [ ] Test backup restoration
- [ ] Security penetration testing

---

## API Security Best Practices

### 1. Always Validate Input

```typescript
import { sanitizeHtml, sanitizeEmail } from '@/lib/security/sanitize';

const cleanName = sanitizeHtml(body.name);
const cleanEmail = sanitizeEmail(body.email);
```

### 2. Use Server-Side Authentication

```typescript
// ❌ WRONG - Client-side only
const user = supabase.auth.getUser();

// ✅ CORRECT - Server-side verification
const { user, error } = await requireAuth(request);
```

### 3. Implement Rate Limiting

```typescript
const rateLimit = withRateLimit(
  getClientIp(request),
  100,  // max attempts
  60000 // window (1 minute)
);
```

### 4. Validate Request Methods

```typescript
const methodError = requireMethod(request, ['POST']);
if (methodError) return methodError;
```

### 5. Log Security Events

```typescript
import { logSecurityEvent } from '@/lib/security/api-middleware';

logSecurityEvent('login_failed', 'warning', {
  userId: user.id,
  ip: getClientIp(request),
  reason: 'Invalid password',
});
```

---

## Database Security

### Row Level Security (RLS)

Always enable RLS on tables:

```sql
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pets"
ON pets FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own pets"
ON pets FOR INSERT
WITH CHECK (auth.uid() = owner_id);
```

### Sensitive Data

- Never store credit card numbers
- Hash passwords (handled by Supabase Auth)
- Encrypt sensitive personal data
- Use secure columns for sensitive fields

---

## Frontend Security

### 1. Never Expose Secrets

```typescript
// ❌ WRONG
const API_KEY = 'sk-1234567890';

// ✅ CORRECT
// Use server-side API routes
const response = await fetch('/api/some-action');
```

### 2. Validate User Input

```typescript
// Always validate before submitting
const email = sanitizeEmail(inputEmail);
if (!email) {
  setError('Invalid email address');
  return;
}
```

### 3. Use HTTPS Only

```typescript
// Enforce HTTPS in production
if (process.env.NODE_ENV === 'production' && 
    window.location.protocol !== 'https:') {
  window.location.protocol = 'https:';
}
```

### 4. Sanitize Display Content

```typescript
// When displaying user content
<div dangerouslySetInnerHTML={{ 
  __html: sanitizeHtml(userContent) 
}} />
```

---

## Webhook Security

For Stripe webhooks and other external services:

```typescript
import { validateSignature } from '@/lib/security/api-middleware';

const signature = request.headers.get('stripe-signature');
const payload = await request.text();

if (!validateSignature(payload, signature, webhookSecret)) {
  return apiError('Invalid signature', 401);
}
```

---

## File Upload Security

### Validation Steps

1. **File Type**: Check MIME type and extension
2. **File Size**: Limit to reasonable size (5MB default)
3. **File Name**: Sanitize to prevent path traversal
4. **Content Scanning**: Scan for malware (in production)
5. **Storage**: Use secure cloud storage (Supabase Storage)

```typescript
import { sanitizeFileName } from '@/lib/security/sanitize';

const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
const maxSize = 5 * 1024 * 1024; // 5MB

if (!allowedTypes.includes(file.type)) {
  throw new Error('Invalid file type');
}

if (file.size > maxSize) {
  throw new Error('File too large');
}

const safeName = sanitizeFileName(file.name);
```

---

## Monitoring & Logging

### What to Log

✅ **Log These**:
- Failed login attempts
- API rate limit hits
- Security validation failures
- Unusual access patterns
- File upload attempts
- Password reset requests

❌ **Never Log These**:
- Passwords
- API keys
- Credit card numbers
- Session tokens
- Personal health information

### Log Format

```typescript
logSecurityEvent('event_name', 'level', {
  userId: user.id,
  ip: getClientIp(request),
  action: 'attempted_action',
  timestamp: new Date().toISOString(),
});
```

---

## Incident Response

### If Security Breach Suspected

1. **Immediate Actions**:
   - Rotate all API keys
   - Force logout all users
   - Enable maintenance mode
   - Preserve logs

2. **Investigation**:
   - Review security logs
   - Check database access patterns
   - Identify affected users
   - Determine scope of breach

3. **Communication**:
   - Notify affected users
   - Report to authorities if required
   - Document incident

4. **Recovery**:
   - Patch vulnerabilities
   - Restore from clean backup if needed
   - Enhanced monitoring
   - Security audit

---

## Security Contacts

- **Security Issues**: security@boompets.com
- **Bug Bounty**: Report vulnerabilities responsibly
- **Emergency**: For critical security issues, contact immediately

---

## Dependencies

### Regular Updates

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

### Security Advisories

Monitor:
- GitHub Security Advisories
- npm Security Advisories
- Supabase Status Page
- Stripe Security Updates

---

## Compliance

### Data Protection

- **GDPR**: EU user data protection
- **CCPA**: California user privacy
- **HIPAA**: Health information (if applicable)
- **PCI DSS**: Payment card data

### User Rights

Users can:
- Request data export
- Request data deletion
- Opt-out of communications
- Review data usage

---

## Testing Security

### Security Testing Checklist

- [ ] SQL injection attempts
- [ ] XSS attacks
- [ ] CSRF attacks
- [ ] Authentication bypass
- [ ] Authorization bypass
- [ ] Rate limit testing
- [ ] Input validation
- [ ] File upload attacks
- [ ] Session hijacking
- [ ] API abuse

### Tools

- **OWASP ZAP**: Security scanner
- **Burp Suite**: Web vulnerability scanner
- **npm audit**: Dependency vulnerabilities
- **Snyk**: Continuous monitoring

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/security)
- [Supabase Security](https://supabase.com/docs/guides/auth/security)
- [Stripe Security](https://stripe.com/docs/security/stripe)

---

## Version History

- **v1.0** (2026-07-11): Initial security implementation
  - HTTP security headers
  - Input sanitization
  - API security middleware
  - CSRF protection
  - Password security
  - Environment validation

---

**Last Updated**: 2026-07-11
**Maintained By**: BoomPets Security Team
