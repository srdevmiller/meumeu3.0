import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function WelcomePage() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const userData = {
    name: searchParams.get('name') || 'Usuário',
    email: searchParams.get('email') || '',
    phone: searchParams.get('phone') || '',
    planType: searchParams.get('planType') || 'basic'
  };

  const getPlanBenefits = (planType: string) => {
    switch (planType.toLowerCase()) {
      case 'professional':
        return [
          "Produtos ilimitados",
          "QR Code do cardápio",
          "Link compartilhável",
          "Categorias ilimitadas",
          "Personalização avançada"
        ];
      case 'enterprise':
        return [
          "Produtos ilimitados",
          "QR Code do cardápio",
          "Link compartilhável",
          "Categorias ilimitadas",
          "Personalização avançada",
          "Suporte prioritário"
        ];
      default:
        return [
          "Até 30 produtos",
          "QR Code do cardápio",
          "Link compartilhável"
        ];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-3xl mx-auto pt-16">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Bem-vindo ao Seu Cardápio Digital!</CardTitle>
            <CardDescription className="text-center text-lg">
              Seu cadastro foi realizado com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Suas informações:</h3>
              <div className="grid gap-2">
                <p><span className="font-medium">Nome:</span> {userData.name}</p>
                <p><span className="font-medium">Email:</span> {userData.email}</p>
                <p><span className="font-medium">Telefone:</span> {userData.phone}</p>
                <p><span className="font-medium">Plano:</span> {userData.planType}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Benefícios do seu plano:</h3>
              <ul className="list-disc pl-5 space-y-2">
                {getPlanBenefits(userData.planType).map((benefit, index) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300">{benefit}</li>
                ))}
              </ul>
            </div>

            <div className="pt-6">
              <Button 
                className="w-full text-lg py-6" 
                onClick={() => setLocation("/auth")}
              >
                Acessar Minha Conta
              </Button>
            </div>

            <p className="text-sm text-center text-gray-500 mt-4">
              Um email foi enviado para {userData.email} com suas credenciais de acesso.
              Use seu email e a senha cadastrada para fazer login.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}