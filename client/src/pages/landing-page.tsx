import { Link } from "wouter";
import mockupDesktop from "../assets/04.jpg";
import img1 from "../assets/img1.png";
import img3 from "../assets/img3.png";
import img4 from "../assets/img4.png";
import img5 from "../assets/img5.png";
import img6 from "../assets/img6.jpg";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600">
      {/* Navbar */}
      <nav className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-white">MenuMaster</h1>
          <Link href="/auth">
            <button className="px-4 sm:px-6 py-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all">
              Login
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-32">
        <div className="max-w-4xl mx-auto text-center mb-12 sm:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-4 sm:mb-8 leading-tight">
            Transforme a Experiência dos Seus Clientes
          </h2>
          <h3 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-6 sm:mb-8 leading-tight">
            com um Cardápio Digital Inteligente e Profissional
          </h3>
          <p className="text-base sm:text-lg text-white/80 mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
            Diga adeus aos cardápios físicos desatualizados e complicados! Com nossa plataforma, você cria um cardápio digital profissional em poucos minutos, garantindo uma experiência moderna, dinâmica e eficiente para seus clientes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
            <Link href="/auth">
              <button className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-white text-purple-600 rounded-full font-medium hover:bg-gray-100 transition-all">
                Comece Agora Grátis
              </button>
            </Link>
            <Link href="/pricing">
              <button className="w-full sm:w-auto px-6 sm:px-8 py-3 border border-white text-white rounded-full font-medium hover:bg-white/10 transition-all">
                Ver Planos
              </button>
            </Link>
          </div>
        </div>

        <div className="px-4 sm:px-6 max-w-5xl mx-auto">
          <img 
            src={mockupDesktop}
            alt="Interface do sistema"
            className="w-full rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-500"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
            <div className="text-center p-4">
              <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Cadastro Instantâneo</h4>
              <p className="text-gray-600 text-sm sm:text-base">Adicione produtos em poucos cliques com imagens e descrições</p>
            </div>
            <div className="text-center p-4">
              <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">100% Personalizável</h4>
              <p className="text-gray-600 text-sm sm:text-base">Escolha cores, fontes e layout do seu cardápio</p>
            </div>
            <div className="text-center p-4">
              <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Acesso Universal</h4>
              <p className="text-gray-600 text-sm sm:text-base">Sem instalações, acessível em qualquer dispositivo</p>
            </div>
            <div className="text-center p-4">
              <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Suporte Dedicado</h4>
              <p className="text-gray-600 text-sm sm:text-base">Assistência técnica sempre que precisar</p>
            </div>
          </div>
        </div>
      </section>

      {/* App Features Section */}
      <section className="bg-gray-50 py-16 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 sm:mb-20">Tudo o que Você Precisa</h2>
          <div className="grid md:grid-cols-2 gap-8 sm:gap-16 items-center">
            <div className="space-y-8 sm:space-y-12 order-2 md:order-1">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">Design Responsivo</h3>
                  <p className="text-gray-600 text-sm sm:text-base">Totalmente responsivo e compatível com todos os navegadores</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">Desempenho Superior</h3>
                  <p className="text-gray-600 text-sm sm:text-base">Servidor dedicado para carregamento rápido e navegação fluida</p>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <img 
                src={img3}
                alt="Recursos do aplicativo"
                className="w-full max-w-md mx-auto transform hover:scale-105 transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-16 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-16 items-center">
            <div className="order-2 md:order-1">
              <img 
                src={img4}
                alt="Interface de gerenciamento"
                className="w-full max-w-md mx-auto transform hover:scale-105 transition-all duration-500"
              />
            </div>
            <div className="space-y-6 sm:space-y-8 order-1 md:order-2">
              <h2 className="text-2xl sm:text-3xl font-bold">Aumente suas Vendas</h2>
              <div className="space-y-4">
                <p className="text-gray-600 text-sm sm:text-base">
                  📱 Navegação intuitiva que permite seus clientes explorarem o cardápio de forma ágil
                </p>
                <p className="text-gray-600 text-sm sm:text-base">
                  💨 Reduza erros no atendimento e aumente a satisfação dos clientes
                </p>
                <p className="text-gray-600 text-sm sm:text-base">
                  🔗 Fácil de configurar, rápido de compartilhar e 100% personalizável
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Não perca mais tempo!</h2>
          <p className="text-lg sm:text-xl text-white/90 mb-8">Digitalize seu cardápio agora e leve seu negócio para o próximo nível.</p>
          <Link href="/auth">
            <button className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 bg-white text-purple-600 rounded-full font-semibold text-base sm:text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300">
              Criar Cardápio Grátis
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}