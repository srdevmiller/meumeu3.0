import { useState, useEffect } from "react";
import { Link } from "wouter";
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
import { useLocation } from "wouter";

// Validation schema for the customer form
const customerFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  cpf: z.string().min(11, "CPF inválido").max(11, "CPF inválido"),
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
      monthly: 49.90,
      yearly: 39.90,
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

  // Consulta periódica do status do pagamento
  useQuery({
    queryKey: ["payment-status", paymentId],
    queryFn: async () => {
      if (!paymentId) return null;
      const response = await fetch(`/api/payments/status/${paymentId}`);
      if (!response.ok) throw new Error("Erro ao verificar pagamento");
      return response.json();
    },
    enabled: !!paymentId,
    refetchInterval: (data: any) => {
      return data?.status === "approved" ? false : 5000;
    },
    onSuccess: (data: any) => {
      if (data?.status === "approved") {
        setShowConfetti(true);
        toast({
          title: "Pagamento aprovado!",
          description: "Seu cadastro foi concluído com sucesso.",
        });
        setTimeout(() => {
          setLocation("/");
        }, 3000); // Delay redirect to show confetti and toast
      }
    },
  });

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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Complete seu cadastro</DialogTitle>
            <DialogDescription>
              Preencha seus dados para continuar com a assinatura do plano {selectedPlan?.name}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <Button type="submit" className="w-full">
                Continuar
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* PIX QR Code Dialog */}
      <Dialog open={showPixCode} onOpenChange={setShowPixCode}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Pagamento via PIX</DialogTitle>
            <DialogDescription>
              Escaneie o QR Code ou copie o código PIX para realizar o pagamento
            </DialogDescription>
          </DialogHeader>
          {generatePixMutation.data && (
            <div className="mt-4 text-center">
              <div className="bg-white p-6 rounded-lg">
                <img
                  src={`data:image/png;base64,${generatePixMutation.data.point_of_interaction.transaction_data.qr_code_base64}`}
                  alt="QR Code PIX"
                  className="mx-auto w-48 h-48"
                />
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Código PIX para copiar e colar:</p>
                  <div className="relative">
                    <div
                      className="p-3 bg-gray-50 rounded border text-xs font-mono break-all cursor-pointer hover:bg-gray-100 transition-colors"
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

                {/* Nova seção - Dados do pedido */}
                <div className="mt-6 border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Dados do pedido</h4>
                  <div className="space-y-2 text-sm text-left">
                    <p className="flex justify-between">
                      <span className="text-gray-500">ID da transação:</span>
                      <span className="font-medium">{generatePixMutation.data.charges_execution_info.internal_execution.execution_id}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500">Descrição:</span>
                      <span className="font-medium">{generatePixMutation.data.description}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500">Titular:</span>
                      <span className="font-medium">{generatePixMutation.data.point_of_interaction.transaction_data.bank_info.collector.account_holder_name}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500">Valor:</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(generatePixMutation.data.transaction_amount)}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-sm text-gray-600">
                    Status do pagamento:
                  </p>
                  <p className="text-sm font-medium text-yellow-600 mt-1">
                    Aguardando confirmação...
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}