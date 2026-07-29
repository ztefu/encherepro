import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-06-24.dahlia' as any,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { paymentIntentId, participantData } = body;

    if (!paymentIntentId || !participantData) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // 1. Retrieve PaymentIntent from Stripe to verify it's paid
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ error: 'Payment not successful' }, { status: 400 });
    }

    const supabase = await createClient();

    // 2. Insert the participant in Supabase securely
    const { data, error } = await supabase.from('participants').insert({
      first_name: participantData.firstName,
      last_name: participantData.lastName,
      email: participantData.email,
      phone: participantData.phone,
      country: participantData.country || "France",
      address: participantData.address,
      city: participantData.city,
      postal_code: participantData.postalCode,
      payment_status: "paid",
      participation_status: "registered",
      sale_id: participantData.saleId
    });

    if (error) {
      console.error('Error inserting participant:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true, participant: data });
  } catch (error: any) {
    console.error('Error confirming registration:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
