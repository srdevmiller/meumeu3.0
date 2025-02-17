import { Link } from "wouter";

// Temporarily remove mockup imports until we have proper images
// Will use text-based content for now
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-teal-500 text-white">
      {/* Hero Section */}
      <div className="relative flex flex-col items-center text-center py-24 px-6">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-extrabold leading-tight">
            Crie seu Cardápio Digital Grátis
          </h1>
          <p className="mt-4 text-lg opacity-90">
            Dê adeus aos cardápios físicos! Com nossa plataforma, você cria um cardápio digital profissional em poucos minutos.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Link href="/auth">
              <button className="px-6 py-3 bg-white text-green-600 font-semibold rounded-xl shadow-md hover:bg-gray-100">
                Registre-se gratuitamente
              </button>
            </Link>
            <Link href="/pricing">
              <button className="px-6 py-3 border border-white text-white font-semibold rounded-xl shadow-md hover:bg-white hover:text-green-600">
                Ver planos e preços
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white text-gray-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Feature Blocks */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-left space-y-4">
              <h2 className="text-3xl font-bold">Cadastro Rápido e Simples</h2>
              <p className="text-lg text-gray-600">
                Adicione seus produtos com fotos, descrições e preços de forma intuitiva.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-gray-100 shadow-lg">
              <div className="aspect-video bg-gray-200 rounded-xl flex items-center justify-center">
                <p className="text-gray-500">Preview do Sistema</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mt-16">
            <div className="order-2 md:order-1 p-8 rounded-2xl bg-gray-100 shadow-lg">
              <div className="aspect-video bg-gray-200 rounded-xl flex items-center justify-center">
                <p className="text-gray-500">Design Responsivo</p>
              </div>
            </div>
            <div className="order-1 md:order-2 text-left space-y-4">
              <h2 className="text-3xl font-bold">Design Profissional</h2>
              <p className="text-lg text-gray-600">
                Interface moderna e responsiva, adaptada a qualquer dispositivo.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 py-12 text-center">
        <h2 className="text-3xl font-extrabold">Pronto para começar?</h2>
        <p className="mt-2 text-lg">Crie seu cardápio digital agora mesmo.</p>
        <div className="mt-6">
          <Link href="/auth">
            <button className="px-6 py-3 bg-white text-green-600 font-semibold rounded-xl shadow-md hover:bg-gray-100">
              Registre-se gratuitamente
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}