import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import clsx from "clsx";

import SearchBar from "../../molecules/SearchBar/SearchBar";
import Button from "../../atoms/Button/Button";
import { useCartStore } from "../../../../core/stores/cartStore";
import { useUIStore } from "../../../../core/stores/uiStore";
import { useDebounce } from "../../../../core/hooks/useDebounce";
import { assets } from "../../../../assets";

const Header = ({ onSearch, onFilterToggle }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showHeaderSearch, setShowHeaderSearch] = useState(false);
  const [headerSearchValue, setHeaderSearchValue] = useState("");

  const { openCart, getTotalItems } = useCartStore();
  const { isMobile, setIsMobile, searchTerm, setSearchTerm } = useUIStore();

  const totalItems = getTotalItems();

  // Debounce para a busca do header
  const debouncedHeaderSearch = useDebounce(headerSearchValue, 300);

  // Detectar scroll com progresso gradual
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Progresso de 0 a 1 baseado em uma distância de 120px (aumentado para dar mais espaço)
      const maxScroll = 120;
      const progress = Math.min(scrollY / maxScroll, 1);
      setScrollProgress(progress);

      // Mostrar search no header quando a barra principal estiver quase sumindo
      setShowHeaderSearch(progress > 0.8);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sincronizar valor da busca do header com o store
  useEffect(() => {
    setHeaderSearchValue(searchTerm);
  }, [searchTerm]);

  // Atualizar store quando digitar na barra do header (com debounce)
  useEffect(() => {
    if (showHeaderSearch && debouncedHeaderSearch !== searchTerm) {
      setSearchTerm(debouncedHeaderSearch);
      onSearch?.(debouncedHeaderSearch);
    }
  }, [
    debouncedHeaderSearch,
    showHeaderSearch,
    setSearchTerm,
    searchTerm,
    onSearch,
  ]);

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
    onSearch?.(searchTerm);
  };

  const handleHeaderSearchChange = (e) => {
    const newValue = e.target.value;
    setHeaderSearchValue(newValue);
  };

  const handleHeaderSearchSubmit = (e) => {
    e.preventDefault();
    onSearch?.(headerSearchValue);
  };

  const handleHeaderSearchClear = () => {
    setHeaderSearchValue("");
    onSearch?.("");
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
          {/* Primeira linha: Logo + Search Header + Carrinho */}
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

            {/* Barra de pesquisa do header - aparece quando rola */}
            <div
              className={clsx(
                "flex-1 max-w-md mx-4 transition-all duration-300 ease-in-out",
                showHeaderSearch
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2 pointer-events-none"
              )}
            >
              <form onSubmit={handleHeaderSearchSubmit} className="relative">
                <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-xl hover:border-primary-300 focus-within:border-primary-300 transition-colors duration-200">
                  {/* Ícone de busca */}
                  <div className="absolute left-3 flex items-center pointer-events-none">
                    <img
                      src={assets.Lupa}
                      alt="Buscar"
                      className="w-4 h-4 object-contain opacity-60"
                    />
                  </div>

                  {/* Input */}
                  <input
                    type="text"
                    value={headerSearchValue}
                    onChange={handleHeaderSearchChange}
                    placeholder="Buscar produtos..."
                    className="w-full pl-10 pr-10 py-2 text-sm bg-transparent border-none outline-none placeholder-gray-500 text-gray-900"
                    autoComplete="off"
                  />

                  {/* Botão de limpar */}
                  {headerSearchValue && (
                    <button
                      type="button"
                      onClick={handleHeaderSearchClear}
                      className="absolute right-3 p-1 hover:bg-gray-200 rounded-md transition-colors duration-200"
                    >
                      <X className="w-3 h-3 text-gray-500" />
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Carrinho */}
            <button
              onClick={handleCartClick}
              className="relative p-2 rounded hover:scale-110 transition-transform duration-200 ease-in-out focus:outline-none"
              style={{ willChange: "transform" }}
            >
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

        {/* Segunda seção: Subtítulos - ANIMAÇÃO BASEADA EM PROGRESSO */}
        <div className="container mx-auto px-4">
          <div
            className="px-1 overflow-hidden transition-all duration-300 ease-out"
            style={{
              height: `${(1 - scrollProgress) * (isMobile ? 82 : 92)}px`,
              opacity: 1 - scrollProgress,
              paddingTop: `${(1 - scrollProgress) * 16}px`,
              paddingBottom: `${(1 - scrollProgress) * 16}px`,
              transform: `translateY(${scrollProgress * -20}px)`,
            }}
          >
            <div
              style={{
                opacity: 1 - scrollProgress * 1.2,
                transform: `translateY(${scrollProgress * -10}px)`,
              }}
            >
              <div
                className={clsx(
                  "mx-auto",
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

        {/* Barra de busca principal - SOME GRADUALMENTE */}
        <div
          className="container mx-auto px-4"
          style={{
            height: `${(1 - scrollProgress) * (isMobile ? 80 : 88)}px`, // Altura que vai para 0
            marginBottom: `${16 * (1 - scrollProgress)}px`,
            opacity: 1 - scrollProgress * 1.5, // Some mais rápido que os títulos
            transform: `translateY(${scrollProgress * -30}px)`, // Move mais para cima
            pointerEvents: scrollProgress > 0.7 ? "none" : "auto", // Desabilita interação quando quase sumiu
            // REMOVIDO overflow-hidden para permitir que sugestões apareçam
          }}
        >
          <div
            className="transition-all duration-300 ease-out"
            style={{
              paddingTop: `${(1 - scrollProgress) * 12}px`, // Padding que vai para 0
              paddingBottom: `${(1 - scrollProgress) * 16}px`, // Padding que vai para 0
            }}
          >
            <div
              className={clsx(
                "mx-auto",
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

        {/* Linha separadora 2 - Full width, fina e cor suave - SOME TAMBÉM */}
        <div
          className="w-full transition-all duration-300 ease-out"
          style={{
            height: `${(1 - scrollProgress) * 1}px`, // Linha que vai para altura 0
            backgroundColor: scrollProgress > 0.9 ? "transparent" : "#d1d5db", // Fica transparente quando quase sumiu
          }}
        ></div>

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
