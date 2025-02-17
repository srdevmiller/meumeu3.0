import { Link } from "wouter";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
              Crie seu Cardápio Digital Grátis
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-white sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Dê adeus aos cardápios físicos e complicados! Com nossa plataforma, você cria um cardápio digital profissional em poucos minutos.
            </p>
            <div className="mt-10">
              <Link href="/auth">
                <button className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-purple-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                  Registre-se gratuitamente
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section with Large Images */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Feature 1 - Large Image Section */}
          <div className="flex flex-col lg:flex-row items-center gap-12 mb-24">
            <div className="lg:w-1/2">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-2xl p-8">
                {/* Placeholder for your image */}
                <div className="aspect-[4/3] bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 rounded-xl"></div>
              </div>
            </div>
            <div className="lg:w-1/2 space-y-4">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Cadastro Rápido e Simples</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Adicione seus produtos com fotos, descrições e preços de forma intuitiva. Personalize seu cardápio em minutos.
              </p>
            </div>
          </div>

          {/* Feature 2 - Large Image Section */}
          <div className="flex flex-col-reverse lg:flex-row items-center gap-12 mb-24">
            <div className="lg:w-1/2 space-y-4">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Design Profissional</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Interface moderna e responsiva que se adapta a qualquer dispositivo. Seus clientes terão uma experiência excepcional.
              </p>
            </div>
            <div className="lg:w-1/2">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-2xl p-8">
                {/* Placeholder for your image */}
                <div className="aspect-[4/3] bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 rounded-xl"></div>
              </div>
            </div>
          </div>

          {/* Feature 3 - Large Image Section */}
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-2xl p-8">
                {/* Placeholder for your image */}
                <div className="aspect-[4/3] bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 rounded-xl"></div>
              </div>
            </div>
            <div className="lg:w-1/2 space-y-4">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Compartilhamento Fácil</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Compartilhe seu cardápio digital através de um link ou QR Code. Sem necessidade de instalação de aplicativos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Pronto para começar?</span>
            <span className="block text-white">Crie seu cardápio digital agora mesmo.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link href="/auth">
                <button className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-purple-600 bg-white hover:bg-gray-50">
                  Registre-se gratuitamente
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}