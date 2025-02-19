import { storage } from "./storage";

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
    // Buscar o admin (primeiro usuário com username admin@admin.com)
    const adminUser = await storage.getUserByUsername("admin@admin.com");
    if (!adminUser) {
      throw new Error("Configurações de pagamento não encontradas");
    }

    // Recuperar as configurações de pagamento do admin
    const paymentSettings = await storage.getPaymentSettings(adminUser.id);
    if (!paymentSettings) {
      throw new Error("Configurações de pagamento não encontradas");
    }

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${paymentSettings.accessToken}`,
        'X-Idempotency-Key': generateIdempotencyKey()
      },
      body: JSON.stringify({
        ...paymentData,
        payment_method_id: 'pix'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erro Mercado Pago:", errorData);
      throw new Error(errorData.message || "Erro ao gerar o PIX");
    }

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
    // Buscar o admin (primeiro usuário com username admin@admin.com)
    const adminUser = await storage.getUserByUsername("admin@admin.com");
    if (!adminUser) {
      throw new Error("Configurações de pagamento não encontradas");
    }

    // Recuperar as configurações de pagamento do admin
    const paymentSettings = await storage.getPaymentSettings(adminUser.id);
    if (!paymentSettings) {
      throw new Error("Configurações de pagamento não encontradas");
    }

    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${paymentSettings.accessToken}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erro Mercado Pago:", errorData);
      throw new Error(errorData.message || "Erro ao verificar o status do pagamento");
    }

    return response.json();
  } catch (error) {
    console.error("Erro ao verificar o status de pagamento:", error);
    throw new Error("Erro ao verificar o status do pagamento");
  }
}