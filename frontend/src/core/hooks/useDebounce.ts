// React & React Hooks
import { useState, useEffect } from 'react';

// ================================
// Custom Hooks
// ================================

/**
 * Hook para debounce de valores.
 * Útil para evitar muitas requisições durante digitação.
 * @param value - Valor a ser debounced
 * @param delay - Delay em milissegundos
 * @returns Valor debounced
 */
export const useDebounce = <T>(value: T, delay: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};