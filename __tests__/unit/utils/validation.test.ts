import {
  aiConsultationSchema,
  isAllowedStripePriceId,
  notificationSchema,
  stripeCheckoutSchema,
  stripeConnectSchema,
  videoRoomSchema,
} from '@/lib/validation/schemas';

describe('Validation Schemas', () => {
  describe('aiConsultationSchema', () => {
    it('accepts valid consultation input', () => {
      const result = aiConsultationSchema.safeParse({
        message: 'What should I feed my dog?',
        petInfo: { name: 'Buddy', species: 'dog', age: 3 },
        conversationHistory: [{ role: 'user', content: 'Hello' }],
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty messages', () => {
      const result = aiConsultationSchema.safeParse({ message: '' });
      expect(result.success).toBe(false);
    });

    it('rejects oversized conversation history', () => {
      const history = Array.from({ length: 21 }, (_, i) => ({
        role: 'user' as const,
        content: `Message ${i}`,
      }));
      const result = aiConsultationSchema.safeParse({
        message: 'test',
        conversationHistory: history,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('stripeCheckoutSchema', () => {
    it('accepts valid checkout input', () => {
      const result = stripeCheckoutSchema.safeParse({
        priceId: 'price_123',
        mode: 'subscription',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid mode', () => {
      const result = stripeCheckoutSchema.safeParse({
        priceId: 'price_123',
        mode: 'invalid',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('stripeConnectSchema', () => {
    it('accepts valid connect input', () => {
      const result = stripeConnectSchema.safeParse({
        email: 'vet@example.com',
        country: 'US',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid country code', () => {
      const result = stripeConnectSchema.safeParse({
        email: 'vet@example.com',
        country: 'usa',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('videoRoomSchema', () => {
    it('accepts valid UUID consultation ID', () => {
      const result = videoRoomSchema.safeParse({
        consultationId: '550e8400-e29b-41d4-a716-446655440000',
      });
      expect(result.success).toBe(true);
    });

    it('rejects non-UUID consultation ID', () => {
      const result = videoRoomSchema.safeParse({
        consultationId: 'not-a-uuid',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('notificationSchema', () => {
    it('accepts valid notification input', () => {
      const result = notificationSchema.safeParse({
        heading: 'Reminder',
        content: 'Your consultation starts in 15 minutes',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty heading', () => {
      const result = notificationSchema.safeParse({
        heading: '',
        content: 'Test',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('isAllowedStripePriceId', () => {
    it('accepts price_ prefixed IDs when no whitelist is configured', () => {
      expect(isAllowedStripePriceId('price_abc123')).toBe(true);
    });

    it('rejects non-price IDs when no whitelist is configured', () => {
      expect(isAllowedStripePriceId('prod_abc123')).toBe(false);
    });
  });
});
