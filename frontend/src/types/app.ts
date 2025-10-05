/**
 * Tipos específicos para o componente App
 */

import { ReactNode } from 'react';

// ================================
// Props do App
// ================================

export interface AppProps {}

// ================================
// Props do IntroVideo
// ================================

export interface IntroVideoProps {
  onEnd: () => void;
  onSkip: () => void;
  isFinished: boolean;
}

// ================================
// Props do Header
// ================================

export interface HeaderProps {
  onSearch: (term: string) => void;
  onFilterToggle: () => void;
}

// ================================
// Estados do App
// ================================

export interface AppState {
  showIntro: boolean;
  introFinished: boolean;
  showBackToTop: boolean;
  debugKey: number;
}

// ================================
// Configuração do React Query
// ================================

export interface QueryClientConfig {
  defaultOptions: {
    queries: {
      retry: number;
      retryDelay: (attemptIndex: number) => number;
      staleTime: number;
      cacheTime: number;
      refetchOnWindowFocus: boolean;
      refetchOnReconnect: boolean;
    };
    mutations: {
      retry: number;
    };
  };
}

// ================================
// Configuração do Toaster
// ================================

export interface ToasterConfig {
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  toastOptions: {
    duration: number;
    style: React.CSSProperties;
    success: {
      iconTheme: {
        primary: string;
        secondary: string;
      };
    };
    error: {
      iconTheme: {
        primary: string;
        secondary: string;
      };
    };
  };
}
