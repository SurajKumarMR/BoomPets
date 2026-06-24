import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

// Create Stripe Connect account for nutritionists (marketplace sellers)
export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 503 }
      );
    }

    const { email, country, userId } = await request.json();

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
        userId,
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
      onboardingUrl: accountLink.url 
    });
  } catch (error) {
    console.error('Stripe Connect error:', error);
    return NextResponse.json(
      { error: 'Failed to create connect account' },
      { status: 500 }
    );
  }
}
