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

      {/* Features Section */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="relative p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-purple-600 mb-4">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Cadastro Rápido e Simples</h3>
              <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                Adicione seus produtos com fotos, descrições e preços de forma intuitiva.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="relative p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-purple-600 mb-4">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Personalize do Seu Jeito</h3>
              <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                Escolha cores, imagens de fundo e deixe o cardápio com a cara do seu negócio.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="relative p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-purple-600 mb-4">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Acesso Fácil e Sem Instalações</h3>
              <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                Seus clientes acessam seu cardápio direto pelo link, sem precisar baixar apps.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="relative p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-purple-600 mb-4">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Gratuito e Sem Limites</h3>
              <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                Cadastre quantos produtos quiser, sem cobranças ou restrições.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="relative p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-purple-600 mb-4">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aumente suas Vendas Agora</h3>
              <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                Facilite o atendimento e aumente a satisfação dos seus clientes com um cardápio digital moderno.
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