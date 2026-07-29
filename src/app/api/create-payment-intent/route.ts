import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-06-24.dahlia' as any,
});

export async function POST(req: Request) {
  try {
    const { saleId, email } = await req.json();

    const supabase = await createClient();

    // 1. Fetch settings to get registration fee
    const { data: settings } = await supabase
      .from('settings')
      .select('registration_fee')
      .eq('id', 1)
      .single();

    const feeAmount = settings?.registration_fee || 25; // Default 25 if not found

    // 2. Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(feeAmount * 100), // Stripe expects amounts in cents
      currency: 'eur',
      payment_method_types: ['card'],
      metadata: {
        saleId,
        email,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
