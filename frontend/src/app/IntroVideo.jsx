import { useEffect, useRef, useState, useCallback } from "react";
import { assets } from "../assets";

// Função para detectar se é mobile
const detectIsMobile = () =>
  /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    navigator.userAgent.toLowerCase()
  );

// Função para detectar navegadores lentos/limitados
const detectSlowBrowser = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return (
    userAgent.includes("instagram") ||
    userAgent.includes("fbav") ||
    userAgent.includes("twitter") ||
    userAgent.includes("snapchat") ||
    userAgent.includes("tiktok") ||
    // Detecta dispositivos com pouca memória
    navigator.deviceMemory < 4 ||
    // Detecta conexão lenta
    (navigator.connection &&
      navigator.connection.effectiveType === "slow-2g") ||
    (navigator.connection && navigator.connection.effectiveType === "2g")
  );
};

const IntroVideo = ({ onEnd, onSkip, isFinished }) => {
  const imgRef = useRef(null);
  const timeoutRef = useRef(null);
  const loadTimeoutRef = useRef(null);

  const [gifError, setGifError] = useState(false);
  const [gifLoaded, setGifLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(detectIsMobile());
  const [isSlowBrowser, setIsSlowBrowser] = useState(detectSlowBrowser());
  const [animationDuration, setAnimationDuration] = useState(null);
  const [skipIntro, setSkipIntro] = useState(false);

  // Duração reduzida para navegadores lentos
  const NORMAL_DURATION = 5000; // 5 segundos
  const FAST_DURATION = 2500; // 2.5 segundos para navegadores lentos
  const MAX_LOAD_TIME = 3000; // 3 segundos máximo para carregar

  useEffect(() => {
    setIsMobile(detectIsMobile());
    setIsSlowBrowser(detectSlowBrowser());

    // Em navegadores muito lentos, pula direto
    if (
      detectSlowBrowser() &&
      navigator.connection?.effectiveType === "slow-2g"
    ) {
      setSkipIntro(true);
      setTimeout(onEnd, 500);
    }
  }, [onEnd]);

  // Timeout de segurança para carregamento
  useEffect(() => {
    loadTimeoutRef.current = setTimeout(() => {
      if (!gifLoaded && !gifError) {
        console.warn("GIF demorou muito para carregar, pulando intro");
        setGifError(true);
        onEnd();
      }
    }, MAX_LOAD_TIME);

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [gifLoaded, gifError, onEnd]);

  const handleGifLoad = useCallback(() => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }

    setGifLoaded(true);

    // Duração adaptada baseada no tipo de navegador
    const duration = isSlowBrowser ? FAST_DURATION : NORMAL_DURATION;
    setAnimationDuration(duration);

    // Timer principal para finalizar
    timeoutRef.current = setTimeout(() => {
      onEnd();
    }, duration);
  }, [isSlowBrowser, onEnd]);

  const handleGifError = useCallback(
    (e) => {
      console.error("Erro ao carregar GIF:", e);

      // Limpa timeouts
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setGifError(true);
      // Delay menor para erro
      setTimeout(() => {
        onEnd();
      }, 500);
    },
    [onEnd]
  );

  useEffect(() => {
    const img = imgRef.current;
    if (img && !skipIntro) {
      // Preload da imagem para verificar se existe
      const preloadImg = new Image();

      preloadImg.onload = () => {
        // Se preload funcionou, carrega no elemento principal
        img.src = getGifSource();
      };

      preloadImg.onerror = (e) => {
        handleGifError(e);
      };

      // Inicia preload
      preloadImg.src = getGifSource();

      // Event listeners para o elemento principal
      img.addEventListener("load", handleGifLoad);
      img.addEventListener("error", handleGifError);

      return () => {
        img.removeEventListener("load", handleGifLoad);
        img.removeEventListener("error", handleGifError);
      };
    }
  }, [skipIntro, handleGifLoad, handleGifError]);

  // Cleanup dos timeouts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, []);

  const handleSkip = useCallback(() => {
    // Limpa todos os timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    onSkip();
  }, [onSkip]);

  // Seleciona o GIF apropriado baseado no dispositivo
  const getGifSource = () => {
    return isMobile ? assets.intro : assets.introH;
  };

  // Se deve pular o intro completamente
  if (skipIntro) {
    return null;
  }

  // Tela de erro melhorada
  if (gifError) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="mb-4">
            <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
          <p className="mb-2">Carregando experiência...</p>
          <p className="text-sm opacity-70">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-500 ${
        isFinished ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* GIF com otimizações */}
      <img
        ref={imgRef}
        alt="Intro Animation"
        className="w-full h-full object-cover"
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "cover",
          // Otimizações para performance
          imageRendering: isMobile ? "optimizeSpeed" : "auto",
          willChange: "auto",
        }}
        // Atributos para melhor performance
        loading="eager"
        decoding="sync"
        onLoad={handleGifLoad}
        onError={handleGifError}
      />

      {/* Loading indicator melhorado */}
      {!gifLoaded && !gifError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex flex-col items-center space-y-4">
            {/* Loading spinner mais suave */}
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white text-sm opacity-70">
              {isSlowBrowser ? "Otimizando..." : "Carregando..."}
            </p>

            {/* Botão de pular para navegadores lentos */}
            {isSlowBrowser && (
              <button
                onClick={handleSkip}
                className="mt-4 px-4 py-2 bg-white bg-opacity-20 text-white text-sm rounded-full hover:bg-opacity-30 transition-all duration-200"
              >
                Pular Intro
              </button>
            )}
          </div>
        </div>
      )}

      {/* Progress bar adaptada */}
      {gifLoaded && animationDuration && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-64 max-w-[80%]">
          <div className="w-full bg-white bg-opacity-20 rounded-full h-1">
            <div
              className="bg-white h-1 rounded-full transition-all ease-linear"
              style={{
                width: "100%",
                animation: `progress ${animationDuration}ms linear`,
              }}
            />
          </div>

          {/* Botão de pular sempre visível em mobile */}
          {isMobile && (
            <button
              onClick={handleSkip}
              className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-white bg-opacity-20 text-white text-xs rounded-full hover:bg-opacity-30 transition-all duration-200"
            >
              Pular
            </button>
          )}
        </div>
      )}

      {/* CSS otimizado */}
      <style jsx>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        /* Otimizações para performance */
        img {
          transform: translateZ(0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
};

export default IntroVideo;
