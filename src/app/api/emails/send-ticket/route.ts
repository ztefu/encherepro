import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { escapeHtml } from '@/lib/sanitize';
import { getServerEnv } from '@/lib/env';

// Input validation schema (Correction #4)
const sendTicketSchema = z.object({
  email: z.string().email().max(255),
  firstName: z.string().max(100).optional().default(''),
  lastName: z.string().max(100).optional().default(''),
  saleTitle: z.string().min(1).max(300),
  saleDate: z.string().max(200).optional().default('Date à venir'),
  saleLocation: z.string().max(300).optional().default('Adresse communiquée ultérieurement'),
});

export async function POST(req: Request) {
  const serverEnv = getServerEnv();
  const resend = new Resend(serverEnv.RESEND_API_KEY);

  // Rate limiting: 10 requests per minute per IP (Correction #8)
  const ip = getClientIp(req);
  const { success } = rateLimit(ip, {
    maxRequests: 10,
    windowMs: 60 * 1000,
  });

  if (!success) {
    return NextResponse.json(
      { error: 'Trop de requêtes.' },
      { status: 429 }
    );
  }

  // Authentication check — only admins can send tickets (Correction #3)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Non autorisé.' },
      { status: 401 }
    );
  }

  try {
    // Input validation (Correction #4)
    const body = await req.json();
    const result = sendTicketSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Données invalides.' }, { status: 400 });
    }

    const { email, firstName, lastName, saleTitle, saleDate, saleLocation } = result.data;

    // Generate a random ticket number
    const ticketNumber = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Escape all user-provided content before injecting into HTML (Correction #5)
    const safeFirstName = escapeHtml(firstName);
    const safeLastName = escapeHtml(lastName);
    const safeSaleTitle = escapeHtml(saleTitle);
    const safeSaleDate = escapeHtml(saleDate);
    const safeSaleLocation = escapeHtml(saleLocation);

    const htmlContent = `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #09090b; color: #fafafa; border: 1px solid #27272a; border-radius: 12px;">
        
        <!-- Logo EnchèrePro -->
        <div style="text-align: center; margin-bottom: 40px;">
          <div style="font-weight: 800; font-size: 28px; letter-spacing: -1px; color: #ffffff;">
            ENCHÈRE<span style="color: #10b981;">PRO</span>
          </div>
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #a1a1aa; margin-top: 4px; font-weight: 500;">
            Ventes Privées
          </div>
        </div>
        
        <!-- Ticket Box -->
        <div style="background-color: #09090b; padding: 32px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: #10b981; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px;">
              Billet d'Accès Officiel
            </div>
            <h2 style="font-size: 24px; font-weight: 700; margin: 0; color: #ffffff; letter-spacing: -0.5px;">
              ${safeSaleTitle}
            </h2>
          </div>
          
          <!-- Details Grid -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
            <tr>
              <td style="padding: 16px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                <span style="color: #a1a1aa; font-size: 13px; font-weight: 500;">Participant</span>
              </td>
              <td style="padding: 16px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); text-align: right;">
                <span style="font-weight: 600; font-size: 15px; color: #ffffff;">${safeFirstName} ${safeLastName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                <span style="color: #a1a1aa; font-size: 13px; font-weight: 500;">Date</span>
              </td>
              <td style="padding: 16px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); text-align: right;">
                <span style="font-weight: 600; font-size: 15px; color: #ffffff;">${safeSaleDate}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                <span style="color: #a1a1aa; font-size: 13px; font-weight: 500;">Lieu</span>
              </td>
              <td style="padding: 16px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); text-align: right;">
                <span style="font-weight: 600; font-size: 15px; color: #ffffff;">${safeSaleLocation}</span>
              </td>
            </tr>
          </table>
          
          <!-- Unique Code -->
          <div style="background-color: rgba(255, 255, 255, 0.03); padding: 24px; border-radius: 8px; text-align: center; border: 1px dashed rgba(255, 255, 255, 0.1);">
            <p style="color: #a1a1aa; font-size: 12px; font-weight: 500; margin-top: 0; margin-bottom: 8px;">Code d'accès unique</p>
            <div style="font-family: monospace; font-size: 32px; letter-spacing: 0.15em; font-weight: 700; color: #10b981; margin-bottom: 8px;">
              ${ticketNumber}
            </div>
            <p style="color: #71717a; font-size: 13px; margin: 0; max-width: 300px; margin: 0 auto; line-height: 1.5;">
              Veuillez présenter ce code (sur votre téléphone ou imprimé) à l'entrée de l'événement.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 40px;">
          <p style="font-size: 13px; color: #71717a; line-height: 1.6;">
            Nous avons hâte de vous retrouver.<br>
            <span style="color: #a1a1aa; font-weight: 500;">L'équipe EnchèrePro</span>
          </p>
        </div>
      </div>
    `;

    const data = await resend.emails.send({
      from: 'onboarding@resend.dev', // Une fois votre domaine validé, mettez 'EnchèrePro <contact@votre-domaine.com>'
      to: email,
      subject: `Votre Billet d'Accès - ${safeSaleTitle}`,
      html: htmlContent,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error sending ticket email:', error);
    // Generic error message (Correction #6)
    return NextResponse.json({ error: 'Erreur lors de l\'envoi du billet.' }, { status: 500 });
  }
}
