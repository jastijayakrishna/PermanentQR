import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import type Stripe from 'stripe';

const CODES_MAP: Record<string, number> = {
  single: 1,
  five_pack: 5,
  unlimited: 9999,
};

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    if (!sig) {
      return NextResponse.json({ error: 'Missing signature.' }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const productType = session.metadata?.product_type;

      if (!userId || !productType) {
        console.error('Missing metadata in checkout session:', session.id);
        return NextResponse.json({ received: true });
      }

      const codesToAdd = CODES_MAP[productType] || 0;
      if (codesToAdd === 0) {
        console.error('Unknown product_type:', productType);
        return NextResponse.json({ received: true });
      }

      const { data: user, error: userError } = await supabase
        .from('users')
        .select('codes_remaining')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        console.error('User not found for webhook:', userId);
        return NextResponse.json({ received: true });
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({ codes_remaining: user.codes_remaining + codesToAdd })
        .eq('id', userId);

      if (updateError) {
        console.error('Failed to increment codes_remaining:', updateError);
      }

      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: userId,
          stripe_payment_id: (session.payment_intent as string) || session.id,
          amount_cents: session.amount_total || 0,
          product_type: productType,
        });

      if (paymentError) {
        console.error('Failed to insert payment record:', paymentError);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
