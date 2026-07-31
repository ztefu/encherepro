import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { Resend } from 'resend';
import { escapeHtml } from '@/lib/sanitize';
import { getServerEnv } from '@/lib/env';

export async function POST(req: Request) {
  const serverEnv = getServerEnv();
  const stripe = new Stripe(serverEnv.STRIPE_SECRET_KEY, {
    apiVersion: '2026-06-24.dahlia' as any,
  });
  const webhookSecret = serverEnv.STRIPE_WEBHOOK_SECRET;
  const resend = new Resend(serverEnv.RESEND_API_KEY);

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
        serverEnv.NEXT_PUBLIC_SUPABASE_URL,
        serverEnv.SUPABASE_SERVICE_ROLE_KEY
      );

      // 1. Insert participant
      const { error: participantError } = await supabaseAdmin.from('participants').insert({
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

      // 2. Increment participants count and send email receipt DIRECTLY (no HTTP call)
      try {
        const { data: sale } = await supabaseAdmin.from('sales').select('title, participants').eq('id', metadata.saleId).single();
        if (sale) {
          await supabaseAdmin.from('sales').update({ participants: (sale.participants || 0) + 1 }).eq('id', metadata.saleId);
          
          // Insert a notification for the admin
          await supabaseAdmin.from('notifications').insert({
            title: "Nouvelle inscription",
            message: `${metadata.firstName} ${metadata.lastName} s'est inscrit(e) à la vente "${sale.title}".`,
            type: "success"
          });
          
          // Send receipt email DIRECTLY via Resend instead of calling an HTTP endpoint
          // This avoids the need for the email route to be publicly accessible (Correction #3)
          const amount = paymentIntent.amount / 100;
          const safeFirstName = escapeHtml(metadata.firstName || '');
          const safeLastName = escapeHtml(metadata.lastName || '');
          const safeSaleTitle = escapeHtml(sale.title);

          await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: metadata.email,
            subject: `Reçu de paiement - Inscription à la vente ${safeSaleTitle}`,
            html: buildReceiptHtml(safeFirstName, safeLastName, safeSaleTitle, amount),
          });
        }
      } catch (countError) {
        console.error('Error incrementing participants count or sending receipt:', countError);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    // Generic error message — never leak internal details (Correction #6)
    return NextResponse.json(
      { error: 'Webhook processing error' },
      { status: 500 }
    );
  }
}

/**
 * Build the receipt email HTML with pre-escaped values.
 */
function buildReceiptHtml(firstName: string, lastName: string, saleTitle: string, amount: number): string {
  return `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #09090b; color: #fafafa; border: 1px solid #27272a; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 40px;">
        <div style="font-weight: 800; font-size: 28px; letter-spacing: -1px; color: #ffffff;">
          ENCHÈRE<span style="color: #10b981;">PRO</span>
        </div>
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #a1a1aa; margin-top: 4px; font-weight: 500;">
          Ventes Privées
        </div>
      </div>
      <div style="background-color: #09090b; padding: 32px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1);">
        <p style="font-size: 16px; color: #e4e4e7; margin-top: 0; margin-bottom: 24px;">
          Bonjour <span style="font-weight: 600; color: #fff;">${firstName} ${lastName}</span>,
        </p>
        <p style="font-size: 15px; color: #a1a1aa; margin-bottom: 32px; line-height: 1.6;">
          Nous confirmons la réception de votre paiement de <strong style="color: #ffffff;">${amount} €</strong> pour les frais de dossier de la vente privée :<br>
          <strong style="color: #ffffff; display: block; margin-top: 12px; font-size: 18px;">${saleTitle}</strong>
        </p>
        <div style="background-color: rgba(255, 255, 255, 0.03); padding: 20px; border-radius: 8px; border: 1px dashed rgba(255, 255, 255, 0.1); margin-bottom: 32px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #a1a1aa; font-size: 13px;">Statut</td>
              <td style="padding: 8px 0; text-align: right; color: #10b981; font-weight: 600;">Réussie ✅</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #a1a1aa; font-size: 13px;">Date</td>
              <td style="padding: 8px 0; text-align: right; color: #e4e4e7; font-weight: 600;">${new Date().toLocaleDateString('fr-FR')}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #a1a1aa; font-size: 13px;">Montant</td>
              <td style="padding: 8px 0; text-align: right; color: #e4e4e7; font-weight: 600;">${amount} €</td>
            </tr>
          </table>
        </div>
        <div style="border-left: 4px solid #10b981; padding-left: 16px;">
          <p style="font-size: 14px; color: #a1a1aa; margin: 0; line-height: 1.6;">
            Votre demande d'inscription est en cours de traitement. Vous recevrez très prochainement votre <strong style="color: #ffffff;">Billet d'Accès</strong> officiel.
          </p>
        </div>
      </div>
      <div style="text-align: center; margin-top: 40px; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 24px;">
        <p style="font-size: 12px; color: #71717a; margin-bottom: 8px;">Ceci est un reçu automatique.</p>
        <p style="font-size: 12px; color: #52525b; margin: 0;">&copy; ${new Date().getFullYear()} EnchèrePro</p>
      </div>
    </div>
  `;
}
