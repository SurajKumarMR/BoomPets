/**
 * Environment variable validation and security checks
 */

interface EnvConfig {
  name: string;
  required: boolean;
  sensitive: boolean;
  pattern?: RegExp;
  description?: string;
}

const ENV_VARS: EnvConfig[] = [
  // Supabase
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    sensitive: false,
    pattern: /^https:\/\/.+\.supabase\.co$/,
    description: 'Supabase project URL',
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    sensitive: false,
    description: 'Supabase anonymous key',
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    sensitive: true,
    description: 'Supabase service role key (server-side only)',
  },
  
  // Stripe
  {
    name: 'STRIPE_SECRET_KEY',
    required: false,
    sensitive: true,
    pattern: /^sk_(test|live)_/,
    description: 'Stripe secret key',
  },
  {
    name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    required: false,
    sensitive: false,
    pattern: /^pk_(test|live)_/,
    description: 'Stripe publishable key',
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    required: false,
    sensitive: true,
    pattern: /^whsec_/,
    description: 'Stripe webhook secret',
  },
  
  // Anthropic
  {
    name: 'ANTHROPIC_API_KEY',
    required: false,
    sensitive: true,
    pattern: /^sk-ant-/,
    description: 'Anthropic API key for AI features',
  },
  
  // Daily.co
  {
    name: 'DAILY_API_KEY',
    required: false,
    sensitive: true,
    description: 'Daily.co API key for video',
  },
  
  // OneSignal
  {
    name: 'ONESIGNAL_APP_ID',
    required: false,
    sensitive: false,
    description: 'OneSignal app ID',
  },
  {
    name: 'ONESIGNAL_API_KEY',
    required: false,
    sensitive: true,
    description: 'OneSignal API key',
  },
];

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  missing: string[];
  missingOptional: string[];
}

/**
 * Validate all environment variables
 */
export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missing: string[] = [];
  const missingOptional: string[] = [];

  for (const config of ENV_VARS) {
    const value = process.env[config.name];

    // Check if required variable is missing
    if (config.required && !value) {
      missing.push(config.name);
      errors.push(`Missing required environment variable: ${config.name}`);
      if (config.description) {
        errors.push(`  Description: ${config.description}`);
      }
      continue;
    }

    // Track optional missing variables
    if (!config.required && !value) {
      missingOptional.push(config.name);
      continue;
    }

    if (value) {
      // Validate pattern if provided
      if (config.pattern && !config.pattern.test(value)) {
        errors.push(`Invalid format for ${config.name}`);
        if (config.description) {
          errors.push(`  Expected: ${config.description}`);
        }
      }

      // Check for exposed sensitive variables
      if (config.sensitive && config.name.startsWith('NEXT_PUBLIC_')) {
        errors.push(`Sensitive variable ${config.name} should not be public (remove NEXT_PUBLIC_ prefix)`);
      }

      // Check for placeholder values
      const placeholders = ['your_', 'changeme', 'example', 'test_value', 'TODO'];
      if (placeholders.some(p => value.toLowerCase().includes(p))) {
        warnings.push(`${config.name} appears to contain a placeholder value`);
      }

      // Check for development keys in production
      if (process.env.NODE_ENV === 'production') {
        if (value.includes('test') && config.name.includes('KEY')) {
          warnings.push(`${config.name} appears to be a test key in production`);
        }
      }

      // Check for exposed secrets
      if (config.sensitive) {
        checkForSecretExposure(config.name, value, warnings);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    missing,
    missingOptional,
  };
}

/**
 * Check if a secret might be exposed
 */
function checkForSecretExposure(name: string, value: string, warnings: string[]): void {
  // Check if secret is too short (likely a test value)
  if (value.length < 20) {
    warnings.push(`${name} is suspiciously short (${value.length} characters)`);
  }

  // Check for weak secrets
  if (/^(admin|password|secret|test|1234)/i.test(value)) {
    warnings.push(`${name} appears to be a weak secret`);
  }
}

/**
 * Mask sensitive environment variable for logging
 */
export function maskSecret(value: string, visibleChars: number = 4): string {
  if (!value || value.length <= visibleChars) {
    return '***';
  }

  const visible = value.substring(0, visibleChars);
  return `${visible}${'*'.repeat(value.length - visibleChars)}`;
}

/**
 * Log environment configuration (safely)
 */
export function logEnvironmentConfig(): void {
  console.log('Environment Configuration:');
  console.log(`  NODE_ENV: ${process.env.NODE_ENV}`);
  
  for (const config of ENV_VARS) {
    const value = process.env[config.name];
    if (value) {
      const displayValue = config.sensitive ? maskSecret(value) : value;
      console.log(`  ${config.name}: ${displayValue}`);
    } else {
      console.log(`  ${config.name}: NOT SET ${config.required ? '❌ REQUIRED' : '⚠️  OPTIONAL'}`);
    }
  }
}

/**
 * Check if all required environment variables are set
 */
export function hasRequiredEnvVars(): boolean {
  return ENV_VARS
    .filter(config => config.required)
    .every(config => !!process.env[config.name]);
}

/**
 * Get missing required environment variables
 */
export function getMissingRequiredEnvVars(): string[] {
  return ENV_VARS
    .filter(config => config.required && !process.env[config.name])
    .map(config => config.name);
}

/**
 * Initialize and validate environment on startup
 */
export function initializeEnvironment(): void {
  const result = validateEnvironment();

  if (!result.valid) {
    console.error('❌ Environment validation failed:');
    result.errors.forEach(error => console.error(`  ${error}`));
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid environment configuration in production');
    }
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️  Environment warnings:');
    result.warnings.forEach(warning => console.warn(`  ${warning}`));
  }

  if (result.missingOptional.length > 0) {
    console.info('ℹ️  Optional environment variables not set:');
    result.missingOptional.forEach(name => {
      const config = ENV_VARS.find(c => c.name === name);
      console.info(`  ${name}${config?.description ? ` - ${config.description}` : ''}`);
    });
  }

  if (result.valid) {
    console.log('✅ Environment validation passed');
  }
}
