# BoomPets - Comprehensive Testing Guide

This document covers all 22 testing categories for the BoomPets application.

---

## Quick Start

```bash
# Run all unit and component tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run end-to-end tests
npm run test:e2e

# Run accessibility tests
npm run test:a11y

# Run all tests (unit + e2e)
npm run test:all
```

---

## Testing Categories Implemented

### ✅ 1. Functional Testing
**Location:** `__tests__/e2e/user-journey.spec.ts`

Tests implemented:
- [x] Navigation between screens
- [x] Forms and basic interactions
- [x] Search and filters (specialist filtering)
- [ ] User registration and login (awaiting auth implementation)
- [ ] Push notifications (awaiting backend)
- [ ] File upload/download (awaiting implementation)
- [ ] Payments and subscriptions (awaiting Stripe setup)

**Run:** `npm run test:e2e`

---

### ✅ 2. Unit Testing
**Location:** `__tests__/unit/`

Tests for:
- [x] Input validation
- [x] Calculations (meal amounts)
- [ ] Business logic (to be expanded)
- [ ] API route handlers (to be added)

**Run:** `npm test -- __tests__/unit`

**Coverage Target:** 80%+

---

### ⏭️ 3. Integration Testing
**Location:** `__tests__/integration/`

**Status:** Framework ready, tests to be added when backend is connected

Tests needed:
- [ ] UI ↔ Backend API
- [ ] Backend ↔ Database (Supabase)
- [ ] Authentication flow
- [ ] Payment gateway integration

**Run:** `npm test -- __tests__/integration`

---

### ✅ 4. UI Testing
**Location:** `__tests__/components/`

Tests implemented:
- [x] Navigation component
- [ ] Forms (meal logging, booking)
- [ ] Buttons and menus
- [ ] Screen layouts
- [ ] Dark mode support (if implemented)
- [ ] Responsive behavior

**Run:** `npm test -- __tests__/components`

---

### ✅ 5. End-to-End Testing
**Location:** `__tests__/e2e/`
**Tool:** Playwright

User journeys tested:
- [x] Navigation through all pages
- [x] Specialist browsing and filtering
- [x] Meal logging form interaction
- [ ] Sign up → Login (awaiting auth)
- [ ] Browse → Purchase → Payment (awaiting Stripe)
- [ ] Profile update (awaiting backend)

**Run:** `npm run test:e2e`
**UI Mode:** `npm run test:e2e:ui`

---

### ⏭️ 6. Compatibility Testing

**Browsers:** Configured in `playwright.config.ts`
- [x] Chrome/Chromium
- [x] Firefox
- [x] Safari/WebKit
- [x] Mobile Chrome (Pixel 5)
- [x] Mobile Safari (iPhone 12)

**Devices to test manually:**
- [ ] Small phones (iPhone SE)
- [ ] Large phones (iPhone Pro Max)
- [ ] Tablets (iPad)
- [ ] Foldable devices

**Run:** Tests run across all browsers automatically with Playwright

---

### ⏭️ 7. Performance Testing

**Tools:** Lighthouse CI, Web Vitals

**Metrics to measure:**
- [ ] App Launch Time
- [ ] First Contentful Paint (FCP)
- [ ] Largest Contentful Paint (LCP)
- [ ] Cumulative Layout Shift (CLS)
- [ ] Time to Interactive (TTI)
- [ ] Bundle size

**Target:** Lighthouse score >90

**Manual testing:**
```bash
# Build production bundle
npm run build

# Check bundle size
npx @next/bundle-analyzer

# Run Lighthouse
npx lighthouse http://localhost:3000 --view
```

---

### ⏭️ 8. Network Testing

**Tool:** Playwright with network throttling

**Scenarios to test:**
- [ ] Wi-Fi
- [ ] 4G/5G
- [ ] Slow 3G
- [ ] Offline mode
- [ ] Network switching
- [ ] Packet loss

**Manual testing:**
- Use Chrome DevTools → Network tab → Throttling
- Test loading states
- Test retry mechanisms
- Test offline caching

---

### ⏭️ 9. Interrupt Testing

**Scenarios:**
- [ ] Incoming calls (mobile)
- [ ] SMS notifications
- [ ] System notifications
- [ ] Low battery warnings
- [ ] Screen lock
- [ ] App backgrounding
- [ ] App switching

**Mobile-specific:** Requires testing on actual devices or emulators

---

### ⏭️ 10. Installation and Update Testing

**Scenarios:**
- [ ] Fresh installation
- [ ] Upgrade from previous version
- [ ] Data migration
- [ ] Uninstall and reinstall

**For web app:** Test with browser caching cleared

---

### ✅ 11. Security Testing

**Tests implemented:**
- [x] Environment variable protection
- [x] API key not exposed to client
- [x] Server-side only API calls

**Tests needed:**
- [ ] Authentication security
- [ ] Authorization checks
- [ ] Input sanitization
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Rate limiting

**Tools:**
- npm audit (dependency vulnerabilities)
- Snyk
- OWASP ZAP

**Run security audit:**
```bash
npm audit
npm audit fix
```

---

### ✅ 12. Accessibility Testing

**Location:** `__tests__/accessibility/`
**Tool:** jest-axe, axe-core

**Tests:**
- [x] Screen reader support (aria-labels)
- [x] Semantic HTML
- [x] Image alt text
- [x] Navigation labels
- [ ] Color contrast (manual validation needed)
- [ ] Font scaling
- [ ] Keyboard navigation

**Standards:** WCAG 2.1 AA

**Run:** `npm run test:a11y`

**Manual testing:**
- VoiceOver (Mac): Cmd + F5
- TalkBack (Android)
- Keyboard-only navigation (Tab, Enter, Space, Arrows)

---

### ⏭️ 13. Localization Testing

**Status:** Not yet implemented

**Tests needed:**
- [ ] Multiple languages support
- [ ] Date/time formats
- [ ] Currency formats
- [ ] Right-to-left layouts
- [ ] Character rendering

**Implementation:** Use next-i18n or similar

---

### ⏭️ 14. Push Notification Testing

**Status:** OneSignal configured, testing pending backend setup

**Tests needed:**
- [ ] Notification delivery
- [ ] Deep links
- [ ] Foreground behavior
- [ ] Background behavior
- [ ] Permission handling
- [ ] Notification grouping

---

### ⏭️ 15. Permission Testing

**Permissions in web app:**
- [ ] Camera (for pet photos)
- [ ] Location (for nearby vets)
- [ ] Microphone (for video calls)
- [ ] Notifications

**Tests:**
- [ ] Grant permission
- [ ] Deny permission
- [ ] Revoke permission later
- [ ] Graceful degradation

---

### ⏭️ 16. Background and Foreground Testing

**Tests:**
- [ ] App resumes correctly after tab switch
- [ ] Session management
- [ ] Data persistence
- [ ] Active timers/intervals

**Browser-specific:** Tab visibility API

---

### ⏭️ 17. Crash and Stability Testing

**Tools:**
- Sentry (error tracking)
- Firebase Crashlytics

**Stress tests:**
- [ ] Rapid clicking/tapping
- [ ] Long-duration use
- [ ] Memory leak detection
- [ ] Concurrent requests

**Implementation:** Add Sentry for production monitoring

---

### ⏭️ 18. Load and Backend Testing

**Status:** Backend not yet deployed

**Tools:**
- k6
- JMeter
- Artillery

**Tests needed:**
- [ ] API response times
- [ ] Concurrent users
- [ ] Database query performance
- [ ] Rate limiting
- [ ] Peak traffic handling

---

### ✅ 19. Regression Testing

**Implementation:** Automated via CI/CD

**Strategy:**
- All unit tests run on every commit
- E2E tests run on PR and deploy
- Visual regression tests (snapshot testing)

**CI/CD:** GitHub Actions workflow (to be created)

---

### ⏭️ 20. Beta Testing

**Platforms:**
- Vercel Preview Deployments (available now)
- [ ] TestFlight (iOS - when native app built)
- [ ] Google Play Internal Testing (Android - when native app built)

**Collect:**
- [ ] Crash reports
- [ ] Performance data
- [ ] User feedback

---

### ⏭️ 21. Store Readiness Testing

**Status:** Web app ready for deployment

**For future native apps:**
- [ ] App signing
- [ ] In-app purchases setup
- [ ] Deep linking
- [ ] App bundles
- [ ] Privacy disclosures
- [ ] Subscription flows

---

### ✅ 22. Post-Release Monitoring

**Tools to implement:**
- [ ] Sentry (error tracking)
- [ ] Firebase Crashlytics
- [ ] Vercel Analytics (built-in)
- [ ] Google Analytics
- [ ] Datadog/New Relic

**Metrics to track:**
- Crash rates
- API failures
- Performance metrics
- User analytics
- Conversion funnel

---

## Testing Workflow

### Development
```bash
# 1. Write code
# 2. Write tests
npm test -- --watch

# 3. Check coverage
npm run test:coverage

# 4. Run E2E tests
npm run test:e2e
```

### Pre-Commit
```bash
# Run all tests
npm run test:all

# Run linter
npm run lint

# Check build
npm run build
```

### Continuous Integration

**GitHub Actions Workflow** (`.github/workflows/test.yml`):
```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run test:e2e
      - run: npm run build
```

---

## Coverage Requirements

### Current Status
- Unit Tests: Framework ready, expand coverage
- Component Tests: Basic navigation tested
- E2E Tests: Core journeys implemented
- Accessibility: Framework ready

### Target Coverage
- **Unit Tests:** 80%+ code coverage
- **Integration Tests:** All API routes
- **E2E Tests:** All critical user paths
- **Accessibility:** WCAG 2.1 AA compliant

---

## Test Data Management

### Mock Data
- Use MSW (Mock Service Worker) for API mocking
- Create realistic test fixtures
- Seed test database for integration tests

### Test Environment
- Separate test database
- Mock API keys (in `jest.setup.js`)
- Isolated test environment

---

## Running Specific Tests

```bash
# Run single test file
npm test -- __tests__/unit/validation.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="Email Validation"

# Run tests for specific page
npm run test:e2e -- user-journey

# Run tests in specific browser
npm run test:e2e -- --project=firefox

# Debug tests
npm test -- --no-coverage --verbose
```

---

## Best Practices

1. **Write tests first** (TDD approach)
2. **Keep tests isolated** (no dependencies between tests)
3. **Use descriptive test names**
4. **Test user behavior, not implementation**
5. **Mock external dependencies**
6. **Clean up after tests**
7. **Run tests before committing**
8. **Keep tests fast** (unit < 1s, E2E < 30s)

---

## Troubleshooting

### Tests failing locally
```bash
# Clear Jest cache
npx jest --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Playwright tests failing
```bash
# Install browsers
npx playwright install

# Update Playwright
npm install -D @playwright/test@latest
npx playwright install
```

### Coverage not accurate
- Check `jest.config.js` collectCoverageFrom
- Ensure all test files match pattern
- Exclude generated files

---

## Next Steps

1. ✅ Testing infrastructure set up
2. Expand unit test coverage
3. Add integration tests when backend is ready
4. Implement visual regression testing
5. Set up CI/CD pipeline
6. Add performance monitoring
7. Implement error tracking (Sentry)
8. Create test data fixtures
9. Add more E2E test scenarios
10. Document mobile-specific testing procedures

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Vitals](https://web.dev/vitals/)

---

**Testing Status:** Infrastructure complete, expand coverage as development continues
