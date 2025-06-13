import { useState, useEffect } from "react";
import { ShoppingCart, Menu, X, Store } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

import Button from "../../atoms/Button/Button";
import SearchBar from "../../molecules/SearchBar/SearchBar";
import { useCartStore } from "../../../../core/stores/cartStore";
import { useUIStore } from "../../../../core/stores/uiStore";

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
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo/Brand */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-secondary-900 hidden sm:block">
                  Catálogo
                </h1>
              </div>
            </div>

            {/* Barra de busca - Desktop */}
            <div className="hidden md:block flex-1 max-w-lg mx-8">
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
              <div className="hidden md:block">
                <Button
                  variant="ghost"
                  onClick={handleCartClick}
                  className="relative p-2 hover:bg-secondary-100"
                >
                  <ShoppingCart className="w-6 h-6 text-secondary-700" />

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

              {/* Menu mobile toggle */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  onClick={toggleMobileMenu}
                  className="p-2"
                >
                  {mobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Barra de busca - Mobile (sempre visível) */}
          <div className="md:hidden pb-4">
            <SearchBar
              onSearch={handleSearch}
              onFilterToggle={onFilterToggle}
              placeholder="Buscar produtos..."
              showSuggestions={true}
            />
          </div>
        </div>

        {/* Menu mobile */}
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
                  {/* Carrinho - Mobile */}
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={handleCartClick}
                    leftIcon={<ShoppingCart />}
                    className="justify-between"
                  >
                    <span>Carrinho</span>
                    {totalItems > 0 && (
                      <span className="bg-primary-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                        {totalItems > 99 ? "99+" : totalItems}
                      </span>
                    )}
                  </Button>

                  {/* Outros links do menu mobile podem ser adicionados aqui */}
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
