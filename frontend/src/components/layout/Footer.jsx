import React from "react";
import { MessageCircle, Phone, Mail, MapPin, Clock } from "lucide-react";
import { CONFIG } from "../../utils/constants";
import { whatsappService } from "../../services/whatsapp";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleWhatsAppContact = () => {
    const message = `Olá! Gostaria de entrar em contato sobre o catálogo de produtos.`;
    whatsappService.openWhatsApp(message);
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Store Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{CONFIG.loja.nome}</h3>
            <p className="text-gray-300 text-sm">
              Oferecemos os melhores produtos com qualidade garantida e
              atendimento personalizado para nossos clientes.
            </p>
            <div className="flex items-center gap-2">
              <img
                src={CONFIG.loja.logo}
                alt={CONFIG.loja.nome}
                className="h-8 w-auto"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contato</h4>
            <div className="space-y-3">
              <button
                onClick={handleWhatsAppContact}
                className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors text-sm"
              >
                <MessageCircle size={16} />
                <span>WhatsApp</span>
              </button>

              <div className="flex items-center gap-3 text-gray-300 text-sm">
                <Phone size={16} />
                <span>(11) 99999-9999</span>
              </div>

              <div className="flex items-center gap-3 text-gray-300 text-sm">
                <Mail size={16} />
                <span>
                  contato@{CONFIG.loja.nome.toLowerCase().replace(/\s/g, "")}
                  .com
                </span>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Horário de Atendimento</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-3">
                <Clock size={16} />
                <div>
                  <p>Segunda à Sexta: 8h às 18h</p>
                  <p>Sábado: 8h às 14h</p>
                  <p>Domingo: Fechado</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Links Rápidos</h4>
            <div className="space-y-2">
              <a
                href="#"
                className="block text-gray-300 hover:text-white transition-colors text-sm"
              >
                Sobre Nós
              </a>
              <a
                href="#"
                className="block text-gray-300 hover:text-white transition-colors text-sm"
              >
                Política de Privacidade
              </a>
              <a
                href="#"
                className="block text-gray-300 hover:text-white transition-colors text-sm"
              >
                Termos de Uso
              </a>
              <a
                href="#"
                className="block text-gray-300 hover:text-white transition-colors text-sm"
              >
                Como Comprar
              </a>
              <button
                onClick={handleWhatsAppContact}
                className="block text-gray-300 hover:text-white transition-colors text-sm text-left"
              >
                Suporte
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} {CONFIG.loja.nome}. Todos os direitos reservados.
            </p>

            <div className="flex items-center gap-4 text-gray-400 text-sm">
              <span>Desenvolvido com ❤️ para vendas online</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
