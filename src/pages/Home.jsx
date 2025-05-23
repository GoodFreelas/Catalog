import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Package, Star, Truck } from "lucide-react";

const Home = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="py-12 md:py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Bem-vindo ao nosso
            <span className="text-blue-600 block">Catálogo de Produtos</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Descubra nossa seleção de produtos de qualidade. Navegue, adicione
            ao carrinho e finalize sua compra diretamente pelo WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
            >
              <ShoppingBag className="h-5 w-5" />
              Ver Produtos
            </Link>
            <Link
              to="/cart"
              className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors inline-flex items-center justify-center gap-2"
            >
              <Package className="h-5 w-5" />
              Meu Carrinho
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 border-t">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Por que escolher nossos produtos?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Oferecemos a melhor experiência de compra com produtos de qualidade
            e atendimento personalizado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Produtos de Qualidade
            </h3>
            <p className="text-gray-600">
              Selecionamos cuidadosamente cada produto para garantir a melhor
              qualidade para nossos clientes.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Fácil de Comprar
            </h3>
            <p className="text-gray-600">
              Adicione produtos ao carrinho e finalize sua compra diretamente
              pelo WhatsApp de forma rápida e segura.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Entrega Rápida
            </h3>
            <p className="text-gray-600">
              Trabalhamos para entregar seus produtos com rapidez e segurança em
              toda a região.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl text-center text-white my-16">
        <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
        <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
          Explore nosso catálogo completo e encontre os produtos perfeitos para
          você.
        </p>
        <Link
          to="/products"
          className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center gap-2 font-semibold"
        >
          <ShoppingBag className="h-5 w-5" />
          Explorar Produtos
        </Link>
      </div>
    </div>
  );
};

export default Home;
