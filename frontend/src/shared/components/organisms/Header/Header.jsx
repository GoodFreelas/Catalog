import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";

import SearchBar from "../../molecules/SearchBar/SearchBar";
import { useCartStore } from "../../../../core/stores/cartStore";
import { useUIStore } from "../../../../core/stores/uiStore";
import { assets } from "../../../../assets";
// Removido o import do AnimatedCart
// import AnimatedCart from "../../../../features/cart/components/CartIcon/CartIcon";

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
          {/* Primeira linha: Logo + Carrinho (unificado para mobile e desktop) */}
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleLogoClick}
                className="transition-opacity duration-200 hover:opacity-80"
              >
                <img src={assets.logo} alt="Detcheler" className="w-32 h-32" />
              </button>
            </div>

            {/* Carrinho */}
            <button
              onClick={handleCartClick}
              className="relative p-2 rounded hover:scale-110 transition-transform duration-200 ease-in-out focus:outline-none"
              style={{ willChange: "transform" }}
            >
              {/* Substituído AnimatedCart por GIF */}
              <img
                src={assets.Compras}
                alt="Carrinho de compras"
                className={clsx(
                  "object-contain",
                  isMobile ? "w-7 h-7" : "w-6 h-6"
                )}
                style={{
                  width: isMobile ? "28px" : "24px",
                  height: isMobile ? "28px" : "24px",
                }}
              />
              {totalItems > 0 && (
                <div className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems > 99 ? "99+" : totalItems}
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Linha separadora 1 - Full width, fina e cor suave */}
        <div className="w-full h-px bg-gray-300"></div>

        {/* Segunda seção: Subtítulos - ANIMAÇÃO BASEADA EM PROGRESSO (para ambos mobile e desktop) */}
        <div className="container mx-auto px-4">
          <div
            className="px-1 overflow-hidden transition-all duration-300 ease-out"
            style={{
              height: `${(1 - scrollProgress) * (isMobile ? 82 : 92)}px`, // 82px mobile, 92px desktop
              opacity: 1 - scrollProgress, // Fade out gradual
              paddingTop: `${(1 - scrollProgress) * 16}px`,
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
              <div
                className={clsx(
                  "mx-auto", // Centralizado sempre
                  isMobile ? "max-w-full" : "max-w-2xl lg:max-w-3xl"
                )}
              >
                <h3
                  className={clsx(
                    "text-secondary-600 text-left mt-2",
                    isMobile ? "text-xs" : "text-sm"
                  )}
                  style={{ fontFamily: "Mona Sans, sans-serif" }}
                >
                  Buenas, Detcheler!
                </h3>
                <h2
                  className={clsx(
                    "font-bold text-secondary-900 text-left",
                    isMobile ? "text-2xl" : "text-3xl lg:text-4xl"
                  )}
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

        {/* Barra de busca - AJUSTE GRADUAL DO PADDING (para ambos mobile e desktop) */}
        <div
          className="container mx-auto px-4"
          style={{
            marginBottom: `${16 * (1 - scrollProgress)}px`, // mb-4 (16px) que vai para 0
          }}
        >
          <div
            className="transition-all duration-300 ease-out"
            style={{
              paddingTop: `${8 + scrollProgress * 8}px`, // Vai de 8px (mais perto) para 16px
              paddingBottom: `${12 + scrollProgress * 4}px`, // Vai de 12px para 16px
            }}
          >
            <div
              className={clsx(
                "mx-auto", // Centralizado sempre
                isMobile ? "max-w-full" : "max-w-2xl lg:max-w-3xl"
              )}
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
        <div className="w-full h-px bg-gray-300"></div>

        {/* Menu mobile overlay */}
        {mobileMenuOpen && isMobile && (
          <div className="border-t border-gray-300 bg-white/95 backdrop-blur-sm">
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
      {mobileMenuOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Header;
