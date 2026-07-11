/**
 * Security configuration for BoomPets application
 */

export const SECURITY_CONFIG = {
  // Rate Limiting
  rateLimit: {
    api: {
      maxAttempts: 100,
      windowMs: 60000, // 1 minute
    },
    auth: {
      maxAttempts: 5,
      windowMs: 300000, // 5 minutes
    },
    fileUpload: {
      maxAttempts: 10,
      windowMs: 60000,
    },
  },

  // Password Requirements
  password: {
    minLength: 8,
    maxLength: 128,
    requireLowercase: true,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventReuse: 3, // Don't allow last 3 passwords
  },

  // Session
  session: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // Refresh after 1 day
    absoluteTimeout: 30 * 24 * 60 * 60, // 30 days max
  },

  // File Upload
  fileUpload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as string[],
    allowedDocTypes: ['application/pdf'] as string[],
    maxFileNameLength: 255,
  },

  // API
  api: {
    maxRequestSize: 1048576, // 1MB
    timeout: 30000, // 30 seconds
  },

  // CORS
  cors: {
    allowedOrigins:
      process.env.NODE_ENV === 'production'
        ? [process.env.NEXT_PUBLIC_APP_URL || 'https://boompets.com']
        : ['http://localhost:3000', 'http://localhost:3001'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    credentials: true,
  },

  // Content Security
  contentSecurity: {
    allowedDomains: {
      images: ['*.supabase.co', 'data:', 'blob:'],
      scripts: ['*.stripe.com', '*.onesignal.com'],
      connect: [
        '*.supabase.co',
        'api.stripe.com',
        'api.anthropic.com',
        'api.daily.co',
        'onesignal.com',
      ],
      frames: ['*.stripe.com', '*.daily.co'],
    },
  },

  // IP Blocking (can be extended)
  ipBlocking: {
    enabled: true,
    blocklist: [] as string[],
    whitelist: [] as string[],
  },

  // Logging
  logging: {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    logSecurityEvents: true,
    retentionDays: 90,
  },

  // Feature Flags
  features: {
    twoFactorAuth: false, // Coming soon
    biometricAuth: false, // Coming soon
    deviceTracking: true,
    ipWhitelisting: false,
  },
} as const;

export type SecurityConfig = typeof SECURITY_CONFIG;

/**
 * Get security config value safely
 */
export function getSecurityConfig<K extends keyof SecurityConfig>(
  key: K
): SecurityConfig[K] {
  return SECURITY_CONFIG[key];
}

/**
 * Check if IP is blocked
 */
export function isIpBlocked(ip: string): boolean {
  if (!SECURITY_CONFIG.ipBlocking.enabled) return false;
  
  // Check whitelist first
  if (SECURITY_CONFIG.ipBlocking.whitelist.includes(ip)) {
    return false;
  }
  
  // Check blocklist
  return SECURITY_CONFIG.ipBlocking.blocklist.includes(ip);
}

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return SECURITY_CONFIG.cors.allowedOrigins.includes(origin);
}

/**
 * Validate file type
 */
export function isFileTypeAllowed(mimeType: string, category: 'image' | 'document'): boolean {
  const allowed = category === 'image' 
    ? SECURITY_CONFIG.fileUpload.allowedImageTypes
    : SECURITY_CONFIG.fileUpload.allowedDocTypes;
  
  return allowed.includes(mimeType);
}

/**
 * Get rate limit for action
 */
export function getRateLimit(action: 'api' | 'auth' | 'fileUpload'): { maxAttempts: number; windowMs: number } {
  return SECURITY_CONFIG.rateLimit[action];
}
