// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
process.env.STRIPE_SECRET_KEY = 'sk_test_mock'
process.env.ANTHROPIC_API_KEY = 'test-anthropic-key'
process.env.DAILY_API_KEY = 'test-daily-key'
process.env.ONESIGNAL_APP_ID = 'test-onesignal-id'
process.env.ONESIGNAL_REST_API_KEY = 'test-onesignal-key'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
