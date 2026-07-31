import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { getServerEnv } from '@/lib/env';

// Zod schema for input validation (Correction #4)
const paymentIntentSchema = z.object({
  saleId: z.string().uuid('saleId invalide'),
  email: z.string().email('Email invalide').max(255).trim().toLowerCase(),
  firstName: z.string().min(1, 'Prénom requis').max(100).trim(),
  lastName: z.string().min(1, 'Nom requis').max(100).trim(),
  phone: z.string().max(30).optional().default(''),
  country: z.string().max(100).optional().default('France'),
  address: z.string().max(500).optional().default(''),
  city: z.string().max(100).optional().default(''),
  postalCode: z.string().max(20).optional().default(''),
});

export async function POST(req: Request) {
  const serverEnv = getServerEnv();
  const stripe = new Stripe(serverEnv.STRIPE_SECRET_KEY, {
    apiVersion: '2026-06-24.dahlia' as any,
  });

  // Rate limiting: 5 requests per minute per IP (Correction #8)
  const ip = getClientIp(req);
  const { success, remaining } = rateLimit(ip, {
    maxRequests: 5,
    windowMs: 60 * 1000,
  });

  if (!success) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Veuillez réessayer dans quelques instants.' },
      { status: 429 }
    );
  }

  try {
    // Input validation (Correction #4)
    const body = await req.json();
    const result = paymentIntentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Données du formulaire invalides.' },
        { status: 400 }
      );
    }

    const { saleId, email, firstName, lastName, phone, country, address, city, postalCode } = result.data;

    const supabase = await createClient();

    // 0. Check if participant already exists (using admin to bypass RLS)
    const { createClient: createSupabaseAdmin } = await import('@supabase/supabase-js');
    const supabaseAdmin = createSupabaseAdmin(
      serverEnv.NEXT_PUBLIC_SUPABASE_URL,
      serverEnv.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: existingParticipants } = await supabaseAdmin
      .from('participants')
      .select('id')
      .ilike('email', email)
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
        country,
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
    // Generic error message — never leak internal details (Correction #6)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors du traitement de votre paiement.' },
      { status: 500 }
    );
  }
}
