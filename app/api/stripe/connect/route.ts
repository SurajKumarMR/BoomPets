import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { stripeConnectSchema } from '@/lib/validation/schemas';
import { parseJsonBody } from '@/lib/validation/parse-body';

export async function POST(request: NextRequest) {
  const rateLimited = checkRateLimit(request, RATE_LIMITS.connect, 'stripe-connect');
  if (rateLimited) return rateLimited;

  const authResult = await requireRole(request, ['nutritionist', 'vet']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 503 }
      );
    }

    const parsed = await parseJsonBody(request, stripeConnectSchema);
    if ('error' in parsed) return parsed.error;

    const { email, country } = parsed.data;

    const account = await stripe.accounts.create({
      type: 'express',
      country,
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        userId: authResult.id,
      },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/complete`,
      type: 'account_onboarding',
    });

    return NextResponse.json({
      accountId: account.id,
      onboardingUrl: accountLink.url,
    });
  } catch (error) {
    console.error('Stripe Connect error:', error);
    return NextResponse.json(
      { error: 'Failed to create connect account' },
      { status: 500 }
    );
  }
}
