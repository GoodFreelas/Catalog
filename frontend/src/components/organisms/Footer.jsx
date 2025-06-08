import React from "react";
import { Link } from "react-router-dom";
import {
  Store,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Sobre a empresa */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Store className="h-8 w-8 text-primary-400" />
              <span className="font-bold text-xl">E-commerce</span>
            </div>
            <p className="text-gray-300 mb-4">
              Oferecemos os melhores produtos com qualidade garantida e preços
              competitivos. Sua satisfação é nossa prioridade.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links rápidos */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-primary-400 transition-colors"
                >
                  Início
                </Link>
              </li>
              <li>
                <Link
                  to="/produtos"
                  className="text-gray-300 hover:text-primary-400 transition-colors"
                >
                  Produtos
                </Link>
              </li>
              <li>
                <Link
                  to="/categorias"
                  className="text-gray-300 hover:text-primary-400 transition-colors"
                >
                  Categorias
                </Link>
              </li>
              <li>
                <Link
                  to="/sobre"
                  className="text-gray-300 hover:text-primary-400 transition-colors"
                >
                  Sobre Nós
                </Link>
              </li>
            </ul>
          </div>

          {/* Atendimento */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Atendimento</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/contato"
                  className="text-gray-300 hover:text-primary-400 transition-colors"
                >
                  Fale Conosco
                </Link>
              </li>
              <li>
                <Link
                  to="/termos"
                  className="text-gray-300 hover:text-primary-400 transition-colors"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  to="/privacidade"
                  className="text-gray-300 hover:text-primary-400 transition-colors"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link
                  to="/devolucoes"
                  className="text-gray-300 hover:text-primary-400 transition-colors"
                >
                  Trocas e Devoluções
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary-400 flex-shrink-0" />
                <span className="text-gray-300">(51) 99999-9999</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary-400 flex-shrink-0" />
                <span className="text-gray-300">contato@ecommerce.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">
                  Porto Alegre, RS
                  <br />
                  Brasil
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Linha divisória */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} E-commerce. Todos os direitos reservados.
            </p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
              Desenvolvido com ❤️ para oferecer a melhor experiência
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
