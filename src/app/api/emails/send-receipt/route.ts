import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, firstName, lastName, saleTitle, amount } = await req.json();

    if (!email || !saleTitle) {
      return NextResponse.json({ error: 'Email and saleTitle are required' }, { status: 400 });
    }

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
        
        <!-- Receipt Content -->
        <div style="background-color: #09090b; padding: 32px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          <p style="font-size: 16px; color: #e4e4e7; margin-top: 0; margin-bottom: 24px;">
            Bonjour <span style="font-weight: 600; color: #fff;">${firstName || ''} ${lastName || ''}</span>,
          </p>
          
          <p style="font-size: 15px; color: #a1a1aa; margin-bottom: 32px; line-height: 1.6;">
            Nous confirmons la réception de votre paiement de <strong style="color: #ffffff;">${amount} €</strong> pour les frais de dossier de la vente privée :<br>
            <strong style="color: #ffffff; display: block; margin-top: 12px; font-size: 18px; letter-spacing: -0.5px;">${saleTitle}</strong>
          </p>
          
          <div style="background-color: rgba(255, 255, 255, 0.03); padding: 20px; border-radius: 8px; border: 1px dashed rgba(255, 255, 255, 0.1); margin-bottom: 32px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #a1a1aa; font-size: 13px; font-weight: 500;">Statut de la transaction</td>
                <td style="padding: 8px 0; text-align: right; color: #10b981; font-weight: 600; font-size: 14px;">Réussie ✅</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #a1a1aa; font-size: 13px; font-weight: 500;">Date</td>
                <td style="padding: 8px 0; text-align: right; color: #e4e4e7; font-weight: 600; font-size: 14px;">${new Date().toLocaleDateString('fr-FR')}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #a1a1aa; font-size: 13px; font-weight: 500;">Montant</td>
                <td style="padding: 8px 0; text-align: right; color: #e4e4e7; font-weight: 600; font-size: 14px;">${amount} €</td>
              </tr>
            </table>
          </div>
          
          <div style="border-left: 4px solid #10b981; padding-left: 16px; margin-bottom: 8px;">
            <p style="font-size: 14px; color: #a1a1aa; margin: 0; line-height: 1.6;">
              Votre demande d'inscription est maintenant en cours de traitement par notre équipe. Vous recevrez très prochainement un email contenant votre <strong style="color: #ffffff;">Billet d'Accès</strong> officiel.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 40px; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 24px;">
          <p style="font-size: 12px; color: #71717a; margin-bottom: 8px;">
            Ceci est un reçu automatique. Merci de ne pas répondre à cet email.
          </p>
          <p style="font-size: 12px; color: #52525b; margin: 0;">
            &copy; ${new Date().getFullYear()} EnchèrePro - Ventes Privées
          </p>
        </div>
      </div>
    `;

    const data = await resend.emails.send({
      from: 'onboarding@resend.dev', // Une fois votre domaine validé, mettez 'EnchèrePro <contact@votre-domaine.com>'
      to: email,
      subject: `Reçu de paiement - Inscription à la vente ${saleTitle}`,
      html: htmlContent,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error sending receipt email:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
