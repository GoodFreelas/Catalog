import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Package, Home, Grid } from "lucide-react";
import { useCart } from "../context/CartContext";

const Header = () => {
  const { getTotalItems } = useCart();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Package className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Catálogo</h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive("/")
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Home className="h-4 w-4" />
              Início
            </Link>
            <Link
              to="/products"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive("/products")
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Grid className="h-4 w-4" />
              Produtos
            </Link>
          </nav>

          {/* Cart Button */}
          <Link
            to="/cart"
            className="relative bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="hidden sm:inline">Carrinho</span>
            {getTotalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t py-2">
          <nav className="flex items-center justify-center space-x-8">
            <Link
              to="/"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive("/")
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Home className="h-4 w-4" />
              Início
            </Link>
            <Link
              to="/products"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive("/products")
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Grid className="h-4 w-4" />
              Produtos
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
