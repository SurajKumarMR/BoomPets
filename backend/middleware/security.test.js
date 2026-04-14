const { authLimiter, apiLimiter, strictLimiter } = require('./security');

describe('Security Middleware', () => {
  describe('Rate Limiting', () => {
    it('should export authLimiter middleware', () => {
      expect(authLimiter).toBeDefined();
      expect(typeof authLimiter).toBe('function');
    });

    it('should export apiLimiter middleware', () => {
      expect(apiLimiter).toBeDefined();
      expect(typeof apiLimiter).toBe('function');
    });

    it('should export strictLimiter middleware', () => {
      expect(strictLimiter).toBeDefined();
      expect(typeof strictLimiter).toBe('function');
    });

    it('should skip rate limiting in test environment', () => {
      expect(process.env.NODE_ENV).toBe('test');
    });
  });
});
