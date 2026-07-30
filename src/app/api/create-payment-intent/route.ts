import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-06-24.dahlia' as any,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { saleId, email, firstName, lastName, phone, country, address, city, postalCode } = body;

    const supabase = await createClient();

    // 0. Check if participant already exists (using admin to bypass RLS)
    const { createClient: createSupabaseAdmin } = await import('@supabase/supabase-js');
    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: existingParticipants } = await supabaseAdmin
      .from('participants')
      .select('id')
      .ilike('email', email.trim())
      .eq('sale_id', saleId)
      .limit(1);

    if (existingParticipants && existingParticipants.length > 0) {
      return NextResponse.json(
        { error: "Cet Utilisateur est déjà inscrit pour cette vente." },
        { status: 400 }
      );
    }

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
        firstName,
        lastName,
        phone,
        country: country || "France",
        address,
        city,
        postalCode,
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
