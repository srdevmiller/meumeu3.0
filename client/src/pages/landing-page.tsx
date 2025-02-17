import { Link } from "wouter";
import mockupDesktop from "../assets/mockup-desktop-2.jpg";
import mockupMobile1 from "../assets/mockup-mobile-1.png";
import mockupMobile2 from "../assets/mockup-mobile-2.png";
import mockupMobile3 from "../assets/mockup-mobile-3.png";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600">
      {/* Hero Section */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">MenuMaster</h1>
          <Link href="/auth">
            <button className="px-6 py-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all">
              Login
            </button>
          </Link>
        </div>
      </nav>

      <section className="container mx-auto px-6 pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
            Transforme a Experiência dos Seus Clientes
          </h2>
          <h3 className="text-3xl md:text-5xl font-bold text-white mb-8">
            com um Cardápio Digital Inteligente e Profissional
          </h3>
          <p className="text-lg text-white/80 mb-12 max-w-2xl mx-auto">
            Diga adeus aos cardápios físicos desatualizados e complicados! Com nossa plataforma, você cria um cardápio digital profissional em poucos minutos, garantindo uma experiência moderna, dinâmica e eficiente para seus clientes.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth">
              <button className="px-8 py-3 bg-white text-purple-600 rounded-full font-medium hover:bg-gray-100 transition-all">
                Comece Agora Grátis
              </button>
            </Link>
            <Link href="/pricing">
              <button className="px-8 py-3 border border-white text-white rounded-full font-medium hover:bg-white/10 transition-all">
                Ver Planos
              </button>
            </Link>
          </div>
        </div>

        <img 
          src={mockupMobile1}
          alt="Interface do aplicativo"
          className="max-w-sm mx-auto transform hover:scale-105 transition-all duration-500"
        />
      </section>

      {/* Features Section */}
      <section className="bg-white py-32">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 items-center justify-items-center">
            <div className="text-center">
              <h4 className="text-xl font-semibold mb-4">Cadastro Instantâneo</h4>
              <p className="text-gray-600">Adicione produtos em poucos cliques com imagens e descrições</p>
            </div>
            <div className="text-center">
              <h4 className="text-xl font-semibold mb-4">100% Personalizável</h4>
              <p className="text-gray-600">Escolha cores, fontes e layout do seu cardápio</p>
            </div>
            <div className="text-center">
              <h4 className="text-xl font-semibold mb-4">Acesso Universal</h4>
              <p className="text-gray-600">Sem instalações, acessível em qualquer dispositivo</p>
            </div>
            <div className="text-center">
              <h4 className="text-xl font-semibold mb-4">Suporte Dedicado</h4>
              <p className="text-gray-600">Assistência técnica sempre que precisar</p>
            </div>
          </div>
        </div>
      </section>

      {/* App Features Section */}
      <section className="bg-gray-50 py-32">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-20">Tudo o que Você Precisa</h2>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-12">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Design Responsivo</h3>
                  <p className="text-gray-600">Totalmente responsivo e compatível com todos os navegadores</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Desempenho Superior</h3>
                  <p className="text-gray-600">Servidor dedicado para carregamento rápido e navegação fluida</p>
                </div>
              </div>
            </div>
            <img 
              src={mockupMobile2}
              alt="Recursos do aplicativo"
              className="mx-auto transform hover:scale-105 transition-all duration-500"
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-32">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <img 
              src={mockupMobile3}
              alt="Interface de gerenciamento"
              className="mx-auto transform hover:scale-105 transition-all duration-500"
            />
            <div className="space-y-8">
              <h2 className="text-3xl font-bold">Aumente suas Vendas</h2>
              <div className="space-y-4">
                <p className="text-gray-600">
                  📱 Navegação intuitiva que permite seus clientes explorarem o cardápio de forma ágil
                </p>
                <p className="text-gray-600">
                  💨 Reduza erros no atendimento e aumente a satisfação dos clientes
                </p>
                <p className="text-gray-600">
                  🔗 Fácil de configurar, rápido de compartilhar e 100% personalizável
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Não perca mais tempo!</h2>
          <p className="text-xl text-white/90 mb-8">Digitalize seu cardápio agora e leve seu negócio para o próximo nível.</p>
          <Link href="/auth">
            <button className="px-12 py-4 bg-white text-purple-600 rounded-full font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300">
              Criar Cardápio Grátis
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}