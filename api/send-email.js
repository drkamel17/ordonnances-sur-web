export const runtime = 'edge';

export async function POST(request) {
  try {
    const { to, subject, type, nom, situation, lien1, lien2 } = await request.json();
    
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_EMAIL || 'drkamel17@gmail.com';
    
    if (!apiKey) {
      console.log('BREVO_API_KEY not configured, skipping email');
      return new Response(JSON.stringify({ success: false, message: 'Email not configured' }), { headers: { 'Content-Type': 'application/json' } });
    }
    
    const bgColor = type === 'Ordonnance' ? '#ff9800' : '#9C27B0';
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: ${bgColor}; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h2 style="margin: 0;">📩 Nouveau message en attente</h2>
        </div>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px;"><strong>Type:</strong> ${type}</p>
          <p style="font-size: 16px;"><strong>Nom:</strong> ${nom}</p>
          ${situation ? `<p style="font-size: 16px;"><strong>Situation:</strong> ${situation}</p>` : ''}
          <p style="margin-top: 20px;">Cliquez sur un des liens ci-dessous pour gérer ce message:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${lien1}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 5px;">🔧 Ordonnances Sur Web</a>
            <br>
            <a href="${lien2}" style="display: inline-block; background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 5px;">🔧 Certificats Médicaux</a>
          </div>
          <p style="color: #666; font-size: 12px; text-align: center; margin-top: 20px;">
            Cet email a été envoyé automatiquement suite à un nouveau message en attente de validation.
          </p>
        </div>
      </div>
    `;
    
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: 'Dr Daoudi - Notifications' },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent
      })
    });
    
    console.log('Brevo email response:', response.status);
    
    if (response.ok) {
      return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
    } else {
      const error = await response.text();
      return new Response(JSON.stringify({ success: false, message: error }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    
  } catch (error) {
    console.log('Email error:', error.message);
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}