import { z } from 'zod';

const MAX_MESSAGE_LENGTH = 2000;
const MAX_CONVERSATION_TURNS = 20;

const petInfoSchema = z
  .object({
    name: z.string().max(100).optional(),
    species: z.enum(['dog', 'cat', 'exotic']).optional(),
    breed: z.string().max(100).optional(),
    age: z.number().min(0).max(50).optional(),
    weight: z.number().min(0).max(500).optional(),
  })
  .strict();

const conversationMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().max(MAX_MESSAGE_LENGTH),
});

export const aiConsultationSchema = z.object({
  message: z.string().min(1).max(MAX_MESSAGE_LENGTH),
  petInfo: petInfoSchema.optional(),
  conversationHistory: z
    .array(conversationMessageSchema)
    .max(MAX_CONVERSATION_TURNS)
    .default([]),
});

export const stripeCheckoutSchema = z.object({
  priceId: z.string().min(1).max(255),
  mode: z.enum(['subscription', 'payment']).default('subscription'),
});

export const stripeConnectSchema = z.object({
  email: z.string().email().max(255),
  country: z.string().length(2).regex(/^[A-Z]{2}$/),
});

export const videoRoomSchema = z.object({
  consultationId: z.string().uuid(),
});

export const notificationSchema = z.object({
  heading: z.string().min(1).max(100),
  content: z.string().min(1).max(500),
  data: z.record(z.string(), z.unknown()).optional(),
});

export const ALLOWED_STRIPE_PRICE_IDS = [
  process.env.STRIPE_PRICE_PRO_MONTHLY,
  process.env.STRIPE_PRICE_PRO_YEARLY,
  process.env.STRIPE_PRICE_CONSULTATION,
].filter((id): id is string => Boolean(id));

export function isAllowedStripePriceId(priceId: string): boolean {
  if (ALLOWED_STRIPE_PRICE_IDS.length === 0) {
    return priceId.startsWith('price_');
  }
  return ALLOWED_STRIPE_PRICE_IDS.includes(priceId);
}
