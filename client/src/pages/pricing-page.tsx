import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import ReactConfetti from 'react-confetti';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";


// Validation schema for the customer form
const customerFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  cpf: z.string().min(11, "CPF inválido").max(11, "CPF inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type CustomerFormData = z.infer<typeof customerFormSchema>;

type PlanFeature = {
  included: boolean;
  name: string;
};

type Plan = {
  id: string;  // Added id field for plan identification
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: PlanFeature[];
  highlight?: boolean;
};

const plans: Plan[] = [
  {
    id: "basic",
    name: "Básico",
    description: "Perfeito para pequenos estabelecimentos",
    price: {
      monthly: 0,
      yearly: 0,
    },
    features: [
      { included: true, name: "Até 30 produtos" },
      { included: true, name: "QR Code do cardápio" },
      { included: true, name: "Link compartilhável" },
      { included: false, name: "Categorias ilimitadas" },
      { included: false, name: "Personalização avançada" },
      { included: false, name: "Suporte prioritário" },
    ],
  },
  {
    id: "professional",
    name: "Profissional",
    description: "Ideal para estabelecimentos em crescimento",
    price: {
      monthly: 0.10,
      yearly: 0.10,
    },
    features: [
      { included: true, name: "Produtos ilimitados" },
      { included: true, name: "QR Code do cardápio" },
      { included: true, name: "Link compartilhável" },
      { included: true, name: "Categorias ilimitadas" },
      { included: true, name: "Personalização avançada" },
      { included: false, name: "Suporte prioritário" },
    ],
    highlight: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Para redes e grandes estabelecimentos",
    price: {
      monthly: 99.90,
      yearly: 79.90,
    },
    features: [
      { included: true, name: "Produtos ilimitados" },
      { included: true, name: "QR Code do cardápio" },
      { included: true, name: "Link compartilhável" },
      { included: true, name: "Categorias ilimitadas" },
      { included: true, name: "Personalização avançada" },
      { included: true, name: "Suporte prioritário" },
    ],
  },
];

export default function PricingPage() {
  const [yearlyBilling, setYearlyBilling] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showPixCode, setShowPixCode] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Add effect to control confetti duration
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000); // Show confetti for 5 seconds
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      cpf: "",
      password: "",
      confirmPassword: "",
    },
  });

  const validateCPFMutation = useMutation({
    mutationFn: async (cpf: string) => {
      const response = await fetch(`https://www.zlib.servidortree.site/APIprivadam9021M90Madas/index.php?cpf=${cpf}`);
      const data = await response.text();

      if (data === "CPF Inválido ou Servidores Off") {
        throw new Error(data);
      }

      return JSON.parse(data);
    },
  });

  const generatePixMutation = useMutation({
    mutationFn: async (data: { amount: number; planId: string; customerData: CustomerFormData; planType: string }) => {
      const response = await fetch("/api/payments/pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erro ao gerar código PIX");
      }

      return response.json();
    },
  });

  // Atualização do hook useQuery do status do pagamento
  const paymentStatusQuery = useQuery({
    queryKey: ["payment-status", paymentId],
    queryFn: async () => {
      if (!paymentId) return null;
      console.log("Checking payment status for ID:", paymentId);
      const response = await fetch(`/api/payments/status/${paymentId}`);
      if (!response.ok) throw new Error("Erro ao verificar pagamento");
      return response.json();
    },
    enabled: !!paymentId && showPixCode,
    refetchInterval: (data) => {
      if (!data) return 5000;
      return data.status === "approved" ? false : 5000;
    },
    retry: 3,
    staleTime: 0,
  });

  // Manter apenas o useEffect para o toast de aprovação
  useEffect(() => {
    if (paymentStatusQuery.data?.status === "approved") {
      toast({
        title: "Pagamento aprovado!",
        description: "Clique em 'Continuar' para prosseguir.",
      });
    }
  }, [paymentStatusQuery.data?.status, toast]);

  const handlePlanSelection = (plan: Plan) => {
    // Se for plano básico, redireciona para registro e mostra confetti
    if (plan.price.monthly === 0 && plan.price.yearly === 0) {
      setShowConfetti(true);
      setTimeout(() => {
        setLocation("/auth");
      }, 2000); // Delay redirect to show confetti
      return;
    }

    // Se for plano pago, mostra formulário de pagamento
    setSelectedPlan(plan);
    setShowCustomerForm(true);
    setShowPixCode(false);
  };

  const onSubmit = async (data: CustomerFormData) => {
    try {
      // First validate CPF
      await validateCPFMutation.mutateAsync(data.cpf);

      // Calcula o valor total baseado no plano (mensal ou anual)
      const amount = yearlyBilling
        ? Number((selectedPlan!.price.yearly * 12).toFixed(2))  // Preço anual * 12 meses, fixando 2 casas decimais
        : selectedPlan!.price.monthly;     // Preço mensal

      // Gera o código PIX
      const pixResponse = await generatePixMutation.mutateAsync({
        amount,
        planId: selectedPlan!.id,
        customerData: data,
        planType: yearlyBilling ? 'yearly' : 'monthly'  // Adicionando o tipo do plano
      });

      setPaymentId(pixResponse.id);
      setShowCustomerForm(false);
      setShowPixCode(true);

      toast({
        title: "Código PIX gerado",
        description: "Use o QR Code para realizar o pagamento",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao processar pagamento",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}
      {/* Header */}
      <div className="px-4 py-16 mx-auto text-center sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
          Planos e Preços
        </h1>
        <p className="max-w-2xl mx-auto mt-6 text-xl text-gray-500 dark:text-gray-300">
          Escolha o plano ideal para o seu estabelecimento
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mt-8 space-x-3">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Mensal</span>
          <Switch
            checked={yearlyBilling}
            onCheckedChange={setYearlyBilling}
            className="data-[state=checked]:bg-purple-600"
          />
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Anual <span className="text-purple-600">(20% de desconto)</span>
          </span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col ${
                plan.highlight
                  ? "border-purple-600 shadow-xl scale-105"
                  : "border-gray-200"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 text-sm text-white text-center">
                  Mais popular
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="mt-2 flex items-baseline text-5xl font-extrabold">
                  R${" "}
                  {yearlyBilling
                    ? plan.price.yearly.toFixed(2)
                    : plan.price.monthly.toFixed(2)}
                  <span className="ml-1 text-2xl font-medium text-gray-500">
                    /mês
                  </span>
                </div>

                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      {feature.included ? (
                        <svg
                          className="flex-shrink-0 w-5 h-5 text-green-500"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="flex-shrink-0 w-5 h-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      <span
                        className={`ml-3 ${
                          feature.included
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-500"
                        }`}
                      >
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className={`w-full ${
                    plan.highlight
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "bg-gray-800 hover:bg-gray-900"
                  }`}
                  onClick={() => handlePlanSelection(plan)}
                >
                  Começar agora
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Customer Form Dialog */}
      <Dialog open={showCustomerForm} onOpenChange={(open) => {
        setShowCustomerForm(open);
        if (!open) {
          form.reset();
        }
      }}>
        <DialogContent className="w-[85vw] max-w-4xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl">Complete seu cadastro</DialogTitle>
            <DialogDescription className="text-lg">
              Preencha seus dados para continuar com a assinatura do plano {selectedPlan?.name}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-4">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="seu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="(11) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input placeholder="Apenas números" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Digite sua senha" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirme sua senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Digite sua senha novamente" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full py-6 text-lg">
                Continuar
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* PIX QR Code Dialog */}
      <Dialog open={showPixCode} onOpenChange={setShowPixCode}>
        <DialogContent className="w-[85vw] max-w-4xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl">Pagamento via PIX</DialogTitle>
            <DialogDescription className="text-lg">
              Escaneie o QR Code ou copie o código PIX para realizar o pagamento
            </DialogDescription>
          </DialogHeader>
          {generatePixMutation.data && (
            <div className="mt-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* QR Code Section */}
                <div className="flex flex-col items-center space-y-6 p-6 bg-white rounded-lg">
                  <img
                    src={`data:image/png;base64,${generatePixMutation.data.point_of_interaction.transaction_data.qr_code_base64}`}
                    alt="QR Code PIX"
                    className="w-64 h-64"
                  />
                  <div className="w-full space-y-4">
                    <p className="text-sm text-gray-500 text-center">Código PIX para copiar e colar:</p>
                    <div
                      className="p-4 bg-gray-50 rounded border text-xs font-mono break-all cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        navigator.clipboard.writeText(generatePixMutation.data.point_of_interaction.transaction_data.qr_code);
                        toast({
                          title: "Código copiado!",
                          description: "Cole o código no seu aplicativo do banco",
                        });
                      }}
                    >
                      {generatePixMutation.data.point_of_interaction.transaction_data.qr_code}
                    </div>
                  </div>
                </div>

                {/* Order Details Section */}
                <div className="space-y-6 p-6 bg-gray-50 rounded-lg">
                  <h4 className="text-xl font-semibold text-center">Dados do pedido</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">ID da transação:</span>
                      <span className="font-medium">{generatePixMutation.data.charges_execution_info.internal_execution.execution_id}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Descrição:</span>
                      <span className="font-medium">{generatePixMutation.data.description}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Titular:</span>
                      <span className="font-medium">{generatePixMutation.data.point_of_interaction.transaction_data.bank_info.collector.account_holder_name}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Valor:</span>
                      <span className="font-medium text-lg text-green-600">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(generatePixMutation.data.transaction_amount)}
                      </span>
                    </div>
                  </div>

                  {/* Continue Button */}
                  {paymentStatusQuery.data?.status === "approved" && (
                    <Button
                      className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
                      onClick={() => {
                        console.log("Form values:", {
                          name: form.getValues("name"),
                          email: form.getValues("email"),
                          phone: form.getValues("phone"),
                          planType: selectedPlan?.name
                        });

                        const welcomeParams = new URLSearchParams({
                          name: form.getValues("name") || '',
                          email: form.getValues("email") || '',
                          phone: form.getValues("phone") || '',
                          planType: selectedPlan?.name?.toLowerCase() || 'basic'
                        });
                        const welcomeUrl = `/welcome?${welcomeParams.toString()}`;
                        console.log("Redirecting to:", welcomeUrl);
                        setLocation(welcomeUrl);
                      }}
                    >
                      Continuar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}