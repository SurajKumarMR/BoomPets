import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  if (!stripe || !supabaseAdmin) {
    return NextResponse.json(
      { error: 'Services not configured' },
      { status: 503 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Update user subscription in database
        await supabaseAdmin
          .from('users')
          .update({ 
            subscription_tier: 'pro',
            stripe_customer_id: session.customer 
          })
          .eq('id', session.metadata?.userId);
        
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Downgrade user to free tier
        await supabaseAdmin
          .from('users')
          .update({ subscription_tier: 'free' })
          .eq('stripe_customer_id', subscription.customer);
        
        break;
      }

      case 'charge.succeeded': {
        const charge = event.data.object as Stripe.Charge;
        
        // Handle marketplace payment (85/15 split)
        if (charge.metadata?.consultationId) {
          const amount = charge.amount;
          const specialistAmount = Math.floor(amount * 0.85);
          const platformFee = amount - specialistAmount;

          // Create transfer to specialist's connect account
          await stripe.transfers.create({
            amount: specialistAmount,
            currency: charge.currency,
            destination: charge.metadata.specialistStripeAccount,
            metadata: {
              consultationId: charge.metadata.consultationId,
            },
          });

          // Record transaction in database
          await supabaseAdmin.from('transactions').insert({
            consultation_id: charge.metadata.consultationId,
            amount: amount / 100,
            specialist_amount: specialistAmount / 100,
            platform_fee: platformFee / 100,
            status: 'completed'
          });
        }
        
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
