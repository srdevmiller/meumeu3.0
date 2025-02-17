import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

type PlanFeature = {
  included: boolean;
  name: string;
};

type Plan = {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
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
              key={plan.name}
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
                <Link href="/auth">
                  <Button
                    className={`w-full ${
                      plan.highlight
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-gray-800 hover:bg-gray-900"
                    }`}
                  >
                    Começar agora
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
