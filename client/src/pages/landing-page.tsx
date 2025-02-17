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
            NEW EXPERIENCE
          </h2>
          <h3 className="text-3xl md:text-5xl font-bold text-white mb-8">
            With Landing Page
          </h3>
          <p className="text-lg text-white/80 mb-12 max-w-2xl mx-auto">
            Transforme seu estabelecimento com um cardápio digital profissional. 
            Gerencie produtos, preços e categorias de forma simples e elegante.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-8 py-3 bg-white text-purple-600 rounded-full font-medium hover:bg-gray-100 transition-all">
              More Details
            </button>
            <button className="px-8 py-3 border border-white text-white rounded-full font-medium hover:bg-white/10 transition-all">
              Watch Our Video
            </button>
          </div>
        </div>

        <img 
          src={mockupMobile1}
          alt="App interface"
          className="max-w-sm mx-auto transform hover:scale-105 transition-all duration-500"
        />
      </section>

      {/* Features Section */}
      <section className="bg-white py-32">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-4 gap-12 items-center justify-items-center">
            <div className="text-center">
              <h4 className="text-xl font-semibold mb-4">Easy To Use</h4>
              <p className="text-gray-600">Interface intuitiva para gerenciar seu cardápio</p>
            </div>
            <div className="text-center">
              <h4 className="text-xl font-semibold mb-4">Awesome design</h4>
              <p className="text-gray-600">Design moderno e responsivo</p>
            </div>
            <div className="text-center">
              <h4 className="text-xl font-semibold mb-4">Easy to customize</h4>
              <p className="text-gray-600">Personalize cores e estilos</p>
            </div>
            <div className="text-center">
              <h4 className="text-xl font-semibold mb-4">Any time support</h4>
              <p className="text-gray-600">Suporte sempre que precisar</p>
            </div>
          </div>
        </div>
      </section>

      {/* App Features Section */}
      <section className="bg-gray-50 py-32">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-20">App Design Features</h2>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-12">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Responsive Web design</h3>
                  <p className="text-gray-600">Se adapta perfeitamente a qualquer dispositivo</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Loaded With Features</h3>
                  <p className="text-gray-600">Recursos avançados para seu negócio</p>
                </div>
              </div>
            </div>
            <img 
              src={mockupMobile2}
              alt="App features"
              className="mx-auto transform hover:scale-105 transition-all duration-500"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Pronto para começar?</h2>
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