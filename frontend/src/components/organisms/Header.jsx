import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X, Store } from "lucide-react";
import Button from "../atoms/Button";
import Badge from "../atoms/Badge";
import { useCart } from "../../contexts/CartContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleCartClick = () => {
    navigate("/carrinho");
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl text-primary-600 hover:text-primary-700 transition-colors"
          >
            <Store className="h-8 w-8" />
            <span className="hidden sm:block">E-commerce</span>
          </Link>

          {/* Menu Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Início
            </Link>
            <Link
              to="/produtos"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Produtos
            </Link>
            <Link
              to="/categorias"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Categorias
            </Link>
            <Link
              to="/contato"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Contato
            </Link>
          </nav>

          {/* Carrinho e Menu Mobile */}
          <div className="flex items-center gap-3">
            {/* Botão do Carrinho */}
            <Button
              variant="ghost"
              onClick={handleCartClick}
              className="relative p-2"
            >
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <Badge
                  variant="danger"
                  size="small"
                  className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center text-xs"
                >
                  {itemCount > 99 ? "99+" : itemCount}
                </Badge>
              )}
            </Button>

            {/* Menu Mobile Toggle */}
            <Button
              variant="ghost"
              onClick={toggleMenu}
              className="md:hidden p-2"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Menu Mobile */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <nav className="py-4 space-y-2">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary-600 font-medium transition-colors rounded-lg"
              >
                Início
              </Link>
              <Link
                to="/produtos"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary-600 font-medium transition-colors rounded-lg"
              >
                Produtos
              </Link>
              <Link
                to="/categorias"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary-600 font-medium transition-colors rounded-lg"
              >
                Categorias
              </Link>
              <Link
                to="/contato"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary-600 font-medium transition-colors rounded-lg"
              >
                Contato
              </Link>

              {/* Carrinho no menu mobile */}
              <div className="px-4 pt-2 border-t">
                <Button
                  onClick={handleCartClick}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Carrinho ({itemCount})
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
