import React from "react";
import { ShoppingCart, Heart, Menu } from "lucide-react";
import { CONFIG } from "../../utils/constants";
import Button from "../ui/Button";

const Header = ({
  cartItemCount = 0,
  onCartClick,
  onFavoritesClick,
  favoritesCount = 0,
}) => {
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Store Name */}
          <div className="flex items-center gap-4">
            <img
              src={CONFIG.loja.logo}
              alt={CONFIG.loja.nome}
              className="h-8 w-auto"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {CONFIG.loja.nome}
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                Catálogo de Produtos
              </p>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center gap-3">
            {/* Favorites Button */}
            {onFavoritesClick && (
              <Button
                onClick={onFavoritesClick}
                variant="ghost"
                size="sm"
                className="relative hidden sm:flex"
                icon={Heart}
              >
                <span className="hidden md:inline">Favoritos</span>
                {favoritesCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {favoritesCount}
                  </span>
                )}
              </Button>
            )}

            {/* Cart Button */}
            <Button
              onClick={onCartClick}
              variant="primary"
              size="sm"
              className="relative"
              icon={ShoppingCart}
            >
              <span className="hidden md:inline">Carrinho</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {cartItemCount}
                </span>
              )}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="sm:hidden"
              icon={Menu}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
