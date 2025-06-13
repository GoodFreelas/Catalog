import { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

import Button from "../../components/atoms/Button/Button";

const Modal = ({
  isOpen = false,
  onClose,
  title,
  children,
  size = "md",
  showHeader = true,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  className,
  overlayClassName,
  contentClassName,
  ...props
}) => {
  // Fechar com ESC
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeOnEsc, onClose]);

  // Bloquear scroll do body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const sizes = {
    xs: "max-w-sm",
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    "2xl": "max-w-6xl",
    full: "max-w-none m-4",
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
  };

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose?.();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={clsx(
              "fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity",
              overlayClassName
            )}
            onClick={handleOverlayClick}
          />

          {/* Modal Container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ type: "spring", duration: 0.3 }}
              className={clsx(
                "relative w-full bg-white rounded-2xl shadow-strong",
                sizes[size],
                className
              )}
              onClick={(e) => e.stopPropagation()}
              {...props}
            >
              {/* Header */}
              {showHeader && (title || showCloseButton) && (
                <div className="flex items-center justify-between p-6 border-b border-secondary-200">
                  {title && (
                    <h2 className="text-xl font-semibold text-secondary-900">
                      {title}
                    </h2>
                  )}

                  {showCloseButton && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      className="p-2 -mr-2"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              )}

              {/* Content */}
              <div
                className={clsx("p-6", !showHeader && "pt-8", contentClassName)}
              >
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
