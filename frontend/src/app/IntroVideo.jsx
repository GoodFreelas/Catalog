import { useEffect, useRef, useState } from "react";
import { assets } from "../assets";

// Função para detectar se é mobile
const detectIsMobile = () =>
  /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    navigator.userAgent.toLowerCase()
  );

const IntroVideo = ({ onEnd, onSkip, isFinished }) => {
  const imgRef = useRef(null);
  const [gifError, setGifError] = useState(false);
  const [gifLoaded, setGifLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(detectIsMobile());
  const [animationDuration, setAnimationDuration] = useState(null);

  useEffect(() => {
    setIsMobile(detectIsMobile());
  }, []);

  useEffect(() => {
    const img = imgRef.current;
    if (img) {
      // Handler para quando a imagem carrega
      const handleLoad = () => {
        setGifLoaded(true);

        // Duração do GIF:
        const estimatedDuration = 5000; // 5 segundos
        setAnimationDuration(estimatedDuration);

        // Inicia o timer para finalizar a animação
        const timer = setTimeout(() => {
          onEnd();
        }, estimatedDuration);

        // Cleanup function para limpar o timer se o componente desmontar
        return () => clearTimeout(timer);
      };

      // Handler para erros de carregamento
      const handleError = (e) => {
        console.error("Erro ao carregar GIF:", e);
        setGifError(true);
        setTimeout(() => {
          onEnd();
        }, 1000);
      };

      img.addEventListener("load", handleLoad);
      img.addEventListener("error", handleError);

      // Cleanup
      return () => {
        img.removeEventListener("load", handleLoad);
        img.removeEventListener("error", handleError);
      };
    }
  }, [onEnd, isMobile]);

  const handleSkip = () => {
    onSkip();
  };

  // Seleciona o GIF apropriado baseado no dispositivo
  const getGifSource = () => {
    return isMobile ? assets.intro : assets.introH;
  };

  if (gifError) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="mb-4">Erro ao carregar animação</p>
          <p className="text-sm opacity-70">Redirecionando...</p>
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
      {/* GIF */}
      <img
        ref={imgRef}
        src={getGifSource()}
        alt="Intro Animation"
        className="w-full h-full object-cover"
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "cover",
        }}
      />

      {/* Loading indicator */}
      {!gifLoaded && !gifError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <div
                className="w-3 h-3 bg-white rounded-full animate-pulse"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-3 h-3 bg-white rounded-full animate-pulse"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
            <p className="text-white text-sm opacity-70">Carregando...</p>
          </div>
        </div>
      )}

      {/* Progress bar opcional */}
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
        </div>
      )}

      {/* CSS para animação da progress bar */}
      <style jsx>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default IntroVideo;
