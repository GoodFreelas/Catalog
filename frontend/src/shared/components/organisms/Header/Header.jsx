import { useState, useEffect } from "react";
import { ShoppingCart, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

import Button from "../../atoms/Button/Button";
import SearchBar from "../../molecules/SearchBar/SearchBar";
import { useCartStore } from "../../../../core/stores/cartStore";
import { useUIStore } from "../../../../core/stores/uiStore";
import { assets } from "../../../../assets";

const Header = ({ onSearch, onFilterToggle }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { openCart, getTotalItems } = useCartStore();
  const { isMobile, setIsMobile } = useUIStore();

  const totalItems = getTotalItems();

  // Detectar scroll para alterar aparência do header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Detectar tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Fechar menu mobile quando tela ficar grande
      if (!mobile && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    handleResize(); // Executar na montagem
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsMobile, mobileMenuOpen]);

  const handleCartClick = () => {
    openCart();
    setMobileMenuOpen(false);
  };

  const handleSearch = (searchTerm) => {
    // A SearchBar já atualiza o store diretamente, então não precisamos fazer mais nada
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <motion.header
        initial={false}
        animate={{
          backgroundColor: scrolled
            ? "rgba(255, 255, 255, 0.95)"
            : "rgba(255, 255, 255, 1)",
          backdropFilter: scrolled ? "blur(10px)" : "blur(0px)",
        }}
        className={clsx(
          "sticky top-0 z-40 border-b transition-all duration-300",
          scrolled ? "border-secondary-200 shadow-soft" : "border-secondary-100"
        )}
      >
        <div className="container mx-auto px-4">
          {/* Layout Desktop */}
          <div className="hidden md:flex items-center justify-between h-16 lg:h-18">
            {/* Logo/Brand */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <img src={assets.logo} alt="Logo" className="w-32 h-32" />
              </div>
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
              {/* Carrinho - Desktop */}
              <Button
                variant="ghost"
                onClick={handleCartClick}
                className="relative p-2 hover:bg-secondary-100"
              >
                <img src={assets.cart} alt="Carrinho" className="w-6 h-6" />
                {totalItems > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center"
                  >
                    {totalItems > 99 ? "99+" : totalItems}
                  </motion.div>
                )}
              </Button>
            </div>
          </div>

          {/* Layout Mobile */}
          <div className="md:hidden">
            {/* Primeira linha: Logo + Carrinho */}
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-4">
                <img src={assets.logo} alt="Logo" className="w-32 h-32" />
              </div>

              {/* Carrinho */}
              <Button
                variant="ghost"
                onClick={handleCartClick}
                className="relative p-2 hover:bg-secondary-100"
              >
                <img src={assets.cart} alt="Carrinho" className="w-6 h-6" />

                {totalItems > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center"
                  >
                    {totalItems > 99 ? "99+" : totalItems}
                  </motion.div>
                )}
              </Button>
            </div>

            {/* Linha separadora */}
            <div className="border-t border-secondary-900"></div>

            {/* Segunda seção: Subtítulos com animação */}
            <AnimatePresence>
              {!scrolled && (
                <motion.div
                  initial={{ opacity: 1, height: "auto" }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    marginTop: 0,
                    marginBottom: 0,
                    paddingTop: 0,
                    paddingBottom: 0,
                  }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  className="p-5 space-y-0 overflow-hidden"
                >
                  <motion.h3
                    initial={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    className="text-xs text-secondary-900 text-left"
                    style={{ fontFamily: "Mona Sans, sans-serif" }}
                  >
                    Buenas, Detcheler!
                  </motion.h3>
                  <motion.h2
                    initial={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{
                      duration: 0.4,
                      ease: [0.4, 0, 0.2, 1],
                      delay: 0.05,
                    }}
                    className="text-3xl font-bold text-secondary-900 text-left"
                    style={{
                      fontFamily: "Rondal, Arial, sans-serif",
                      fontWeight: 900,
                    }}
                  >
                    O que vamos levar hoje?
                  </motion.h2>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Barra de busca - Mobile */}
            <motion.div
              className="pb-3"
              animate={{
                paddingTop: scrolled ? "1rem" : "0",
                paddingBottom: scrolled ? "1rem" : "0.75rem",
              }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              <SearchBar
                onSearch={handleSearch}
                onFilterToggle={onFilterToggle}
                placeholder="Buscar produtos..."
                showSuggestions={true}
              />
            </motion.div>

            {/* Linha separadora final */}
            <div className="mt-6 border-t border-secondary-900"></div>
          </div>
        </div>

        {/* Menu mobile (caso ainda precise para outras funcionalidades) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-secondary-200 bg-white"
            >
              <div className="container mx-auto px-4 py-4">
                <div className="space-y-4">
                  {/* Outros itens do menu podem ser adicionados aqui */}
                  <div className="text-sm text-secondary-600">
                    Menu adicional (se necessário)
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Overlay para fechar menu mobile */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
