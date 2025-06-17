import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";

import Button from "../../atoms/Button/Button";
import SearchBar from "../../molecules/SearchBar/SearchBar";
import { useCartStore } from "../../../../core/stores/cartStore";
import { useUIStore } from "../../../../core/stores/uiStore";
import { assets } from "../../../../assets";

const Header = ({ onSearch, onFilterToggle }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const { openCart, getTotalItems } = useCartStore();
  const { isMobile, setIsMobile } = useUIStore();

  const totalItems = getTotalItems();

  // Detectar scroll com progresso gradual
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Progresso de 0 a 1 baseado em uma distância de 80px
      const maxScroll = 80;
      const progress = Math.min(scrollY / maxScroll, 1);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Detectar tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (!mobile && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsMobile, mobileMenuOpen]);

  const handleCartClick = () => {
    openCart();
    setMobileMenuOpen(false);
  };

  const handleSearch = (searchTerm) => {
    // A SearchBar já atualiza o store diretamente
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <>
      <header
        className={clsx(
          "sticky top-0 z-40 bg-white border-b transition-all duration-300",
          scrollProgress > 0.5
            ? "bg-white/95 backdrop-blur-sm shadow-sm border-gray-300"
            : "border-gray-200"
        )}
      >
        <div className="container mx-auto px-4">
          {/* Layout Desktop */}
          <div className="hidden md:flex items-center justify-between h-16 lg:h-18">
            {/* Logo/Brand */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogoClick}
                className="flex items-center gap-2 transition-opacity duration-200 hover:opacity-80"
              >
                <img src={assets.logo} alt="Logo" className="w-32 h-32" />
              </button>
            </div>

            {/* Barra de busca - Desktop */}
            <div className="flex-1 max-w-lg mx-8">
              <SearchBar
                onSearch={handleSearch}
                onFilterToggle={onFilterToggle}
                placeholder="Buscar produtos..."
                showSuggestions={true}
              />
            </div>

            {/* Ações do header */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCartClick}
                className="relative p-2 rounded hover:scale-110 transition-transform duration-200 ease-in-out focus:outline-none"
              >
                <img src={assets.cart} alt="Carrinho" className="w-6 h-6" />
                {totalItems > 0 && (
                  <div className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center">
                    {totalItems > 99 ? "99+" : totalItems}
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Layout Mobile */}
          <div className="md:hidden">
            {/* Primeira linha: Logo + Carrinho */}
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLogoClick}
                  className="transition-opacity duration-200 hover:opacity-80"
                >
                  <img
                    src={assets.logo}
                    alt="Detcheler"
                    className="w-32 h-32"
                  />
                </button>
              </div>

              {/* Carrinho */}
              <button
                onClick={handleCartClick}
                className="relative p-2 rounded hover:scale-110 transition-transform duration-200 ease-in-out focus:outline-none"
              >
                <img src={assets.cart} alt="Carrinho" className="w-6 h-6" />
                {totalItems > 0 && (
                  <div className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center">
                    {totalItems > 99 ? "99+" : totalItems}
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Linha separadora 1 - Full width, fina e cor suave */}
        <div className="w-full h-px bg-gray-300"></div>

        {/* Segunda seção: Subtítulos (só mobile) - ANIMAÇÃO BASEADA EM PROGRESSO */}
        <div className="md:hidden">
          <div className="container mx-auto px-4">
            <div
              className="px-1 overflow-hidden transition-all duration-300 ease-out"
              style={{
                height: `${(1 - scrollProgress) * 70}px`, // 64px = h-16, diminui gradualmente
                opacity: 1 - scrollProgress, // Fade out gradual
                paddingTop: `${(1 - scrollProgress) * 16}px`, // py-4 = 16px
                paddingBottom: `${(1 - scrollProgress) * 16}px`,
                transform: `translateY(${scrollProgress * -20}px)`, // Desliza para cima gradualmente
              }}
            >
              <div
                style={{
                  opacity: 1 - scrollProgress * 1.2, // Titles desaparecem um pouco mais rápido
                  transform: `translateY(${scrollProgress * -10}px)`,
                }}
              >
                <h3
                  className="text-xs text-secondary-600 text-left mt-2"
                  style={{ fontFamily: "Mona Sans, sans-serif" }}
                >
                  Buenas, Detcheler!
                </h3>
                <h2
                  className="text-2xl font-bold text-secondary-900 text-left"
                  style={{
                    fontFamily: "Rondal, Arial, sans-serif",
                    fontWeight: 900,
                  }}
                >
                  O que vamos levar hoje?
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de busca - Mobile - AJUSTE GRADUAL DO PADDING */}
        <div className="md:hidden">
          <div className="container mx-auto px-4 mb-4">
            <div
              className="px-0 transition-all duration-300 ease-out"
              style={{
                paddingTop: `${16 + scrollProgress * 2}px`, // Vai de 16px para 32px
                paddingBottom: `${12 + scrollProgress * 1}px`, // Vai de 12px para 16px
              }}
            >
              <SearchBar
                onSearch={handleSearch}
                onFilterToggle={onFilterToggle}
                placeholder="Buscar produtos..."
                showSuggestions={true}
              />
            </div>
          </div>
        </div>

        {/* Linha separadora 2 - Full width, fina e cor suave */}
        <div className="w-full h-px bg-gray-300 md:hidden"></div>

        {/* Menu mobile overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-300 bg-white/95 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4">
              <div className="space-y-4">
                <div className="text-sm text-secondary-600">
                  Menu adicional (se necessário)
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Overlay para fechar menu mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Header;
