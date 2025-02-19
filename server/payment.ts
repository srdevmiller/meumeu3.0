export async function generatePix(paymentData: {
  transaction_amount: number;
  description: string;
  payer: {
    email: string;
    first_name: string;
    last_name: string;
    identification: {
      type: string;
      number: string;
    }
  }
}) {
  try {
    // Recuperar o AccessToken usando as configurações salvas
    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'X-Idempotency-Key': generateIdempotencyKey()
      },
      body: JSON.stringify({
        ...paymentData,
        payment_method_id: 'pix'
      })
    });

    return response.json();
  } catch (error) {
    console.error("Erro ao gerar PIX:", error);
    throw new Error("Erro ao gerar o PIX");
  }
}

function generateIdempotencyKey() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function checkPaymentStatus(paymentId: string) {
  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`
      }
    });

    return response.json();
  } catch (error) {
    console.error("Erro ao verificar o status de pagamento:", error);
    throw new Error("Erro ao verificar o status do pagamento");
  }
}
