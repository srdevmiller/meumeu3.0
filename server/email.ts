import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

interface WelcomeEmailData {
  name: string;
  email: string;
  planType: string;
}

export async function sendWelcomeEmail(data: WelcomeEmailData) {
  const msg = {
    to: data.email,
    from: 'no-reply@cardapiodigital.com', // Substitua pelo seu domínio verificado no SendGrid
    subject: 'Bem-vindo ao Cardápio Digital!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed; text-align: center;">Bem-vindo ao Cardápio Digital!</h1>
        
        <p>Olá ${data.name},</p>
        
        <p>Seu cadastro foi realizado com sucesso! Abaixo estão suas informações de acesso:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Plano:</strong> ${data.planType}</p>
        </div>
        
        <p>Para acessar sua conta, use seu email e a senha que você cadastrou durante o processo de registro.</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://cardapiodigital.com/auth" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Acessar Minha Conta
          </a>
        </div>
        
        <p style="margin-top: 30px;">Se você tiver alguma dúvida, não hesite em nos contatar.</p>
        
        <p>Atenciosamente,<br>Equipe Cardápio Digital</p>
      </div>
    `
  };

  try {
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return false;
  }
}
