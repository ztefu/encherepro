import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-06-24.dahlia' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = (await headers()).get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const metadata = paymentIntent.metadata;

      if (!metadata || !metadata.saleId || !metadata.email) {
        console.warn('PaymentIntent succeeded but missing metadata', paymentIntent.id);
        return NextResponse.json({ received: true }); // Ignore quietly
      }

      // We must use the service role key to bypass RLS since this is a background webhook
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // 1. Insert participant
      const { data: participantData, error: participantError } = await supabaseAdmin.from('participants').insert({
        first_name: metadata.firstName || '',
        last_name: metadata.lastName || '',
        email: metadata.email,
        phone: metadata.phone || '',
        country: metadata.country || "France",
        address: metadata.address || '',
        city: metadata.city || '',
        postal_code: metadata.postalCode || '',
        payment_status: "paid",
        participation_status: "registered",
        sale_id: metadata.saleId
      });

      if (participantError) {
        console.error('Error inserting participant in webhook:', participantError);
        // Do not return 500, otherwise Stripe will retry constantly for a DB constraint error
      }

      // 2. Increment participants count on the sale
      try {
        const { data: sale } = await supabaseAdmin.from('sales').select('participants').eq('id', metadata.saleId).single();
        if (sale) {
          await supabaseAdmin.from('sales').update({ participants: (sale.participants || 0) + 1 }).eq('id', metadata.saleId);
        }
      } catch (countError) {
        console.error('Error incrementing participants count in webhook:', countError);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
