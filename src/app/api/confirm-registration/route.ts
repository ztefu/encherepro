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

    // 3. Increment the participants count on the sale using admin privileges
    try {
      const { createClient: createAdminClient } = require('@supabase/supabase-js');
      const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      const { data: sale } = await supabaseAdmin.from('sales').select('participants').eq('id', participantData.saleId).single();
      if (sale) {
        await supabaseAdmin.from('sales').update({ participants: (sale.participants || 0) + 1 }).eq('id', participantData.saleId);
      }
    } catch (countError) {
      console.error('Error incrementing participants count:', countError);
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
