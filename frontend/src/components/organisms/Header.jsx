import React, { useState } from 'react';
import {
  ShoppingCart,
  Menu,
  X,
  Search,
  User,
  Heart,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { Button } from '../atoms/Button';

export const Header = ({
  onCartClick,
  cartItemsCount = 0,
  onSearchClick,
  onUserClick,
  onFavoritesClick,
  className = ''
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navigationItems = [
    { label: 'Produtos', href: '#produtos', active: true },
    { label: 'Categorias', href: '#categorias' },
    { label: 'Promoções', href: '#promocoes' },
    { label: 'Sobre', href: '#sobre' },
    { label: 'Contato', href: '#contato' }
  ];

  return (
    <header className={`bg-white shadow-sm border-b sticky top-0 z-40 ${className}`}>
      {/* Top Bar - Contact Info */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10 text-sm">
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>(51) 99999-9999</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>contato@lojavonixx.com.br</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Porto Alegre, RS</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-xs">Frete grátis acima de R$ 150,00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg mr-2 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">V</span>
                </div>
                Loja Vonixx
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigationItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`transition-colors ${item.active
                    ? 'text-blue-600 font-medium'
                    : 'text-gray-700 hover:text-blue-600'
                  }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Search Button - Mobile */}
            <Button
              variant="secondary"
              size="sm"
              onClick={onSearchClick}
              className="md:hidden"
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Favorites */}
            <Button
              variant="secondary"
              size="sm"
              onClick={onFavoritesClick}
              className="hidden sm:flex relative"
            >
              <Heart className="w-5 h-5" />
            </Button>

            {/* User Account */}
            <Button
              variant="secondary"
              size="sm"
              onClick={onUserClick}
              className="hidden sm:flex"
            >
              <User className="w-5 h-5" />
            </Button>

            {/* Cart */}
            <Button
              variant="secondary"
              onClick={onCartClick}
              className="relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1">
                  {cartItemsCount > 99 ? '99+' : cartItemsCount}
                </span>
              )}
              <span className="hidden sm:inline ml-2">
                Carrinho {cartItemsCount > 0 && `(${cartItemsCount})`}
              </span>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleMobileMenu}
              className="md:hidden"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 py-2 space-y-1">
            {navigationItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-base transition-colors ${item.active
                    ? 'text-blue-600 bg-blue-50 font-medium'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}

            {/* Mobile-only actions */}
            <div className="border-t pt-2 mt-2 space-y-1">
              <button
                onClick={() => {
                  onFavoritesClick?.();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
              >
                <Heart className="w-5 h-5 mr-3" />
                Favoritos
              </button>

              <button
                onClick={() => {
                  onUserClick?.();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
              >
                <User className="w-5 h-5 mr-3" />
                Minha Conta
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};