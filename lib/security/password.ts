/**
 * Password security utilities
 */

export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  passed: boolean;
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Minimum length check
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
    return { score: 0, feedback, passed: false };
  }

  // Length scoring
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;

  // Character variety checks
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const varietyCount = [hasLowercase, hasUppercase, hasNumbers, hasSpecialChars].filter(Boolean).length;

  if (varietyCount >= 3) score++;
  if (varietyCount === 4) score++;

  // Provide feedback
  if (!hasLowercase) feedback.push('Add lowercase letters');
  if (!hasUppercase) feedback.push('Add uppercase letters');
  if (!hasNumbers) feedback.push('Add numbers');
  if (!hasSpecialChars) feedback.push('Add special characters (!@#$%^&* etc.)');

  // Check for common patterns
  const commonPatterns = [
    /^[0-9]+$/,           // Only numbers
    /^[a-zA-Z]+$/,        // Only letters
    /(.)\1{2,}/,          // Repeated characters (aaa, 111)
    /12345|23456|34567/,  // Sequential numbers
    /abcde|bcdef|cdefg/i, // Sequential letters
  ];

  const hasCommonPattern = commonPatterns.some(pattern => pattern.test(password));
  if (hasCommonPattern) {
    feedback.push('Avoid common patterns and sequences');
    score = Math.max(0, score - 1);
  }

  // Check against common passwords
  const commonPasswords = [
    'password', 'password123', '12345678', 'qwerty', 'abc123', 
    'monkey', '1234567', 'letmein', 'trustno1', 'dragon',
    'baseball', 'iloveyou', 'master', 'sunshine', 'ashley',
  ];

  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    feedback.push('This password is too common');
    return { score: 0, feedback, passed: false };
  }

  const passed = score >= 3 && varietyCount >= 3;

  if (passed && feedback.length === 0) {
    feedback.push('Strong password!');
  }

  return { score, feedback, passed };
}

/**
 * Check if password is in common breach list
 * In production, this should check against Have I Been Pwned API
 */
export async function checkPasswordBreach(password: string): Promise<boolean> {
  // Placeholder for breach checking
  // In production: Use SHA-1 hash and check against HIBP API
  // https://haveibeenpwned.com/API/v3
  
  const commonBreachedPasswords = [
    'password', '123456', '12345678', 'qwerty', 'abc123',
    'monkey', '1234567', 'letmein', 'trustno1', 'dragon',
  ];

  return commonBreachedPasswords.includes(password.toLowerCase());
}

/**
 * Generate a strong random password
 */
export function generateStrongPassword(length: number = 16): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = lowercase + uppercase + numbers + special;
  
  let password = '';
  
  // Ensure at least one of each type
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Estimate time to crack password
 */
export function estimateCrackTime(password: string): string {
  const charset = 
    (/[a-z]/.test(password) ? 26 : 0) +
    (/[A-Z]/.test(password) ? 26 : 0) +
    (/\d/.test(password) ? 10 : 0) +
    (/[^a-zA-Z0-9]/.test(password) ? 32 : 0);
  
  const combinations = Math.pow(charset, password.length);
  
  // Assuming 1 billion attempts per second
  const secondsToCrack = combinations / 1000000000;
  
  if (secondsToCrack < 1) return 'Instantly';
  if (secondsToCrack < 60) return 'Less than a minute';
  if (secondsToCrack < 3600) return 'Less than an hour';
  if (secondsToCrack < 86400) return 'Less than a day';
  if (secondsToCrack < 2592000) return 'Less than a month';
  if (secondsToCrack < 31536000) return 'Less than a year';
  if (secondsToCrack < 3153600000) return 'Decades';
  
  return 'Centuries';
}

/**
 * Check for password reuse (to be implemented with database)
 */
export async function checkPasswordReuse(userId: string, newPassword: string): Promise<boolean> {
  // This should check against hashed previous passwords in database
  // For now, return false (not reused)
  return false;
}

/**
 * Validate password meets requirements
 */
export function validatePasswordRequirements(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
