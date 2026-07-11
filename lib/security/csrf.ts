import { cookies } from 'next/headers';
import { randomBytes, createHash } from 'crypto';

const CSRF_TOKEN_NAME = 'csrf-token';
const CSRF_SECRET_NAME = 'csrf-secret';
const TOKEN_LENGTH = 32;

/**
 * Generate a CSRF token
 */
export async function generateCsrfToken(): Promise<string> {
  const cookieStore = await cookies();
  
  // Get or create secret
  let secret = cookieStore.get(CSRF_SECRET_NAME)?.value;
  
  if (!secret) {
    secret = randomBytes(TOKEN_LENGTH).toString('hex');
    cookieStore.set(CSRF_SECRET_NAME, secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });
  }
  
  // Generate token from secret
  const token = randomBytes(TOKEN_LENGTH).toString('hex');
  const hash = createHash('sha256').update(`${token}-${secret}`).digest('hex');
  
  cookieStore.set(CSRF_TOKEN_NAME, hash, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60, // 1 hour
    path: '/',
  });
  
  return token;
}

/**
 * Validate CSRF token
 */
export async function validateCsrfToken(token: string): Promise<boolean> {
  if (!token) return false;
  
  const cookieStore = await cookies();
  const storedHash = cookieStore.get(CSRF_TOKEN_NAME)?.value;
  const secret = cookieStore.get(CSRF_SECRET_NAME)?.value;
  
  if (!storedHash || !secret) return false;
  
  const expectedHash = createHash('sha256').update(`${token}-${secret}`).digest('hex');
  
  return storedHash === expectedHash;
}

/**
 * CSRF protection middleware for API routes
 */
export async function requireCsrfToken(request: Request): Promise<boolean> {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return true;
  }
  
  const token = request.headers.get('x-csrf-token');
  
  if (!token) {
    return false;
  }
  
  return await validateCsrfToken(token);
}

/**
 * Get CSRF token for forms
 */
export async function getCsrfToken(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CSRF_TOKEN_NAME)?.value;
  
  if (token) {
    return token;
  }
  
  return await generateCsrfToken();
}
