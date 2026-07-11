/**
 * Security utility for sanitizing user inputs
 */

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize SQL input to prevent SQL injection
 */
export function sanitizeSql(input: string): string {
  if (!input) return '';
  
  // Remove potentially dangerous SQL characters
  return input
    .replace(/['";\\]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .replace(/xp_/gi, '')
    .replace(/sp_/gi, '');
}

/**
 * Sanitize file names to prevent directory traversal
 */
export function sanitizeFileName(filename: string): string {
  if (!filename) return '';
  
  return filename
    .replace(/\.\./g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 255); // Limit length
}

/**
 * Sanitize URL to prevent open redirect attacks
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    
    return parsed.toString();
  } catch {
    // If URL parsing fails, return empty string
    return '';
  }
}

/**
 * Validate and sanitize email addresses
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const trimmed = email.trim().toLowerCase();
  
  if (!emailRegex.test(trimmed)) {
    return '';
  }
  
  return trimmed;
}

/**
 * Sanitize phone numbers
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-numeric characters except + at start
  return phone.replace(/[^\d+]/g, '').substring(0, 20);
}

/**
 * Remove potentially dangerous content from user text
 */
export function sanitizeUserText(text: string, maxLength: number = 10000): string {
  if (!text) return '';
  
  return text
    .trim()
    .substring(0, maxLength)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

/**
 * Sanitize number input
 */
export function sanitizeNumber(input: string | number, min?: number, max?: number): number | null {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  
  if (isNaN(num) || !isFinite(num)) {
    return null;
  }
  
  if (min !== undefined && num < min) {
    return min;
  }
  
  if (max !== undefined && num > max) {
    return max;
  }
  
  return num;
}

/**
 * Sanitize integer input
 */
export function sanitizeInteger(input: string | number, min?: number, max?: number): number | null {
  const num = typeof input === 'string' ? parseInt(input, 10) : Math.floor(input);
  
  if (isNaN(num) || !isFinite(num)) {
    return null;
  }
  
  if (min !== undefined && num < min) {
    return min;
  }
  
  if (max !== undefined && num > max) {
    return max;
  }
  
  return num;
}

/**
 * Check for common malicious patterns
 */
export function containsMaliciousPatterns(input: string): boolean {
  const patterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /eval\(/i,
    /expression\(/i,
    /vbscript:/i,
    /data:text\/html/i,
  ];
  
  return patterns.some(pattern => pattern.test(input));
}

/**
 * Validate and sanitize UUID
 */
export function sanitizeUuid(uuid: string): string | null {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(uuid)) {
    return null;
  }
  
  return uuid.toLowerCase();
}

/**
 * Rate limiting helper - tracks attempts per identifier
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxAttempts: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    // New window
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, resetTime: now + windowMs };
  }
  
  if (record.count >= maxAttempts) {
    // Limit exceeded
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }
  
  // Increment count
  record.count++;
  return { allowed: true, remaining: maxAttempts - record.count, resetTime: record.resetTime };
}

/**
 * Clear rate limit for identifier
 */
export function clearRateLimit(identifier: string): void {
  rateLimitMap.delete(identifier);
}
