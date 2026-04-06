import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';
import { stripe } from '@/lib/stripe';

const PRICE_MAP: Record<string, string | undefined> = {
  single: process.env.NEXT_PUBLIC_STRIPE_PRICE_SINGLE,
  five_pack: process.env.NEXT_PUBLIC_STRIPE_PRICE_FIVE_PACK,
  unlimited: process.env.NEXT_PUBLIC_STRIPE_PRICE_UNLIMITED,
};

export async function POST(request: Request) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const { product_type } = body as { product_type: string };

    if (!product_type || !PRICE_MAP[product_type]) {
      return NextResponse.json({ error: 'Invalid product type.' }, { status: 400 });
    }

    const priceId = PRICE_MAP[product_type]!;

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, stripe_customer_id')
      .eq('id', auth.userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    let stripeCustomerId = user.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      });
      stripeCustomerId = customer.id;

      const { error: updateError } = await supabase
        .from('users')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id);

      if (updateError) {
        console.error('Failed to save stripe_customer_id:', updateError);
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?payment=success`,
      cancel_url: `${appUrl}/dashboard?payment=cancelled`,
      metadata: {
        user_id: user.id,
        product_type: product_type,
      },
    });

    return NextResponse.json({ checkout_url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
