import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { checkRateLimit } from './sanitize';

/**
 * API Response helper with security headers
 */
export function apiResponse(data: any, status: number = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

/**
 * API Error response
 */
export function apiError(message: string, status: number = 400, details?: any) {
  return apiResponse(
    {
      error: message,
      ...(details && { details }),
    },
    status
  );
}

/**
 * Authentication middleware - verifies user is authenticated
 */
export async function requireAuth(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  
  if (!supabase) {
    return { error: apiError('Authentication service unavailable', 503), user: null };
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: apiError('Unauthorized - Please log in', 401), user: null };
  }

  return { error: null, user };
}

/**
 * Rate limiting middleware
 */
export function withRateLimit(
  identifier: string,
  maxAttempts: number = 100,
  windowMs: number = 60000
) {
  const result = checkRateLimit(identifier, maxAttempts, windowMs);
  
  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
    return {
      error: NextResponse.json(
        { error: 'Too many requests', retryAfter },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': maxAttempts.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.resetTime.toString(),
          },
        }
      ),
      remaining: 0,
    };
  }
  
  return {
    error: null,
    remaining: result.remaining,
    headers: {
      'X-RateLimit-Limit': maxAttempts.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': result.resetTime.toString(),
    },
  };
}

/**
 * CORS middleware
 */
export function withCors(request: NextRequest, allowedOrigins: string[] = []) {
  const origin = request.headers.get('origin');
  const isAllowed = allowedOrigins.length === 0 || (origin && allowedOrigins.includes(origin));
  
  const headers: HeadersInit = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
  
  if (isAllowed && origin) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  }
  
  return headers;
}

/**
 * Method validation middleware
 */
export function requireMethod(request: NextRequest, allowedMethods: string[]) {
  if (!allowedMethods.includes(request.method)) {
    return apiError(`Method ${request.method} not allowed`, 405);
  }
  return null;
}

/**
 * Content-Type validation
 */
export function requireContentType(request: NextRequest, expectedType: string = 'application/json') {
  const contentType = request.headers.get('content-type');
  
  if (!contentType || !contentType.includes(expectedType)) {
    return apiError(`Content-Type must be ${expectedType}`, 415);
  }
  
  return null;
}

/**
 * Get client IP address
 */
export function getClientIp(request: NextRequest): string {
  // Check various headers for IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnecting = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  if (cfConnecting) {
    return cfConnecting;
  }
  
  return 'unknown';
}

/**
 * Validate request signature (for webhooks)
 */
export function validateSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

/**
 * API Key validation middleware
 */
export function requireApiKey(request: NextRequest, validKeys: string[]) {
  const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!apiKey || !validKeys.includes(apiKey)) {
    return apiError('Invalid or missing API key', 401);
  }
  
  return null;
}

/**
 * Validate request size to prevent large payload attacks
 */
export async function validateRequestSize(request: NextRequest, maxSizeBytes: number = 1048576) {
  const contentLength = request.headers.get('content-length');
  
  if (contentLength && parseInt(contentLength) > maxSizeBytes) {
    return apiError(`Request too large. Max size: ${maxSizeBytes} bytes`, 413);
  }
  
  return null;
}

/**
 * Security logging helper
 */
export function logSecurityEvent(
  event: string,
  level: 'info' | 'warning' | 'error',
  details: Record<string, any>
) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    event,
    level,
    ...details,
  };
  
  // In production, send to logging service
  console.log(`[SECURITY ${level.toUpperCase()}]`, JSON.stringify(logEntry));
}
