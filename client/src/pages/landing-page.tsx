import { Link } from "wouter";
import mockupDesktop from "../assets/mockup-desktop-2.jpg";
import mockupMobile1 from "../assets/mockup-mobile-1.png";
import mockupMobile2 from "../assets/mockup-mobile-2.png";
import mockupMobile3 from "../assets/mockup-mobile-3.png";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-teal-500">
      {/* Hero Section */}
      <div className="relative flex flex-col items-center text-center py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-extrabold leading-tight text-white mb-6">
            Crie seu Cardápio Digital Grátis
          </h1>
          <p className="mt-4 text-lg text-white/90 max-w-2xl mx-auto">
            Dê adeus aos cardápios físicos! Com nossa plataforma, você cria um cardápio digital profissional em poucos minutos.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Link href="/auth">
              <button className="px-6 py-3 bg-white text-green-600 font-semibold rounded-xl shadow-md hover:bg-gray-100 transition-all">
                Registre-se gratuitamente
              </button>
            </Link>
            <Link href="/pricing">
              <button className="px-6 py-3 border border-white text-white font-semibold rounded-xl shadow-md hover:bg-white/10 transition-all">
                Ver planos e preços
              </button>
            </Link>
          </div>
          <div className="mt-12 relative">
            <img 
              src={mockupDesktop} 
              alt="Interface do sistema" 
              className="rounded-xl shadow-2xl max-w-4xl mx-auto w-full"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Feature Blocks */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-left space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">Interface Intuitiva</h2>
              <p className="text-lg text-gray-600">
                Gerencie seus produtos, preços e categorias com facilidade através de uma interface moderna e amigável.
              </p>
            </div>
            <div className="flex justify-center">
              <img 
                src={mockupMobile1} 
                alt="Interface móvel" 
                className="w-[300px] rounded-3xl shadow-xl transform hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mt-24">
            <div className="order-2 md:order-1 flex justify-center">
              <img 
                src={mockupMobile2} 
                alt="Gerenciamento de produtos" 
                className="w-[300px] rounded-3xl shadow-xl transform hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="order-1 md:order-2 text-left space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">Gestão Completa</h2>
              <p className="text-lg text-gray-600">
                Tenha controle total sobre seu cardápio digital, com ferramentas poderosas de gestão e personalização.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mt-24">
            <div className="text-left space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">Visual Personalizado</h2>
              <p className="text-lg text-gray-600">
                Personalize as cores e o estilo do seu cardápio para combinar com a identidade visual do seu estabelecimento.
              </p>
            </div>
            <div className="flex justify-center">
              <img 
                src={mockupMobile3} 
                alt="Personalização visual" 
                className="w-[300px] rounded-3xl shadow-xl transform hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 py-16 text-center">
        <h2 className="text-3xl font-extrabold text-white">Pronto para começar?</h2>
        <p className="mt-2 text-lg text-white/90">Crie seu cardápio digital agora mesmo.</p>
        <div className="mt-8">
          <Link href="/auth">
            <button className="px-8 py-4 bg-white text-green-600 font-semibold rounded-xl shadow-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300">
              Registre-se gratuitamente
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}