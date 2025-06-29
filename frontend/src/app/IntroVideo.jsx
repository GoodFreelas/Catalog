import { useEffect, useRef, useState, useCallback } from "react";
import { assets } from "../assets";

// Função para detectar se é mobile
const detectIsMobile = () =>
  /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    navigator.userAgent.toLowerCase()
  );

const IntroVideo = ({ onEnd, onSkip, isFinished }) => {
  const mountedRef = useRef(true);
  const hasEndedRef = useRef(false);

  const [isMobile] = useState(detectIsMobile());
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // Duração fixa e confiável
  const INTRO_DURATION = isMobile ? 3000 : 4000; // 3s mobile, 4s desktop
  const PROGRESS_INTERVAL = 50; // Atualiza progress a cada 50ms

  // Função que sempre funciona - baseada apenas em tempo
  const endIntro = useCallback(() => {
    if (hasEndedRef.current || !mountedRef.current) return;

    hasEndedRef.current = true;
    console.log("Finalizando intro");
    onEnd();
  }, [onEnd]);

  // Sistema de progress baseado em tempo (não depende do GIF)
  useEffect(() => {
    if (!isActive) return;

    const startTime = Date.now();

    const progressTimer = setInterval(() => {
      if (!mountedRef.current || hasEndedRef.current) {
        clearInterval(progressTimer);
        return;
      }

      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / INTRO_DURATION) * 100, 100);

      setProgress(newProgress);

      // Quando completa, finaliza
      if (newProgress >= 100) {
        clearInterval(progressTimer);
        endIntro();
      }
    }, PROGRESS_INTERVAL);

    // Timeout de segurança
    const safetyTimeout = setTimeout(() => {
      clearInterval(progressTimer);
      endIntro();
    }, INTRO_DURATION + 500);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(safetyTimeout);
    };
  }, [endIntro, isActive, INTRO_DURATION]);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleSkip = useCallback(() => {
    if (hasEndedRef.current) return;

    console.log("Skip manual");
    setIsActive(false);
    hasEndedRef.current = true;
    onSkip();
  }, [onSkip]);

  // Seleciona o GIF
  const getGifSource = () => {
    return isMobile ? assets.intro : assets.introH;
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-300 ${
        isFinished ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* GIF - carrega em background, mas não dependemos dele */}
      <img
        src={getGifSource()}
        alt="Intro Animation"
        className="w-full h-full object-cover"
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "cover",
          opacity: 0.9, // Pequena transparência para suavizar loops
        }}
        loading="eager"
        onError={() => console.log("GIF erro (ok, continuamos)")}
        onLoad={() => console.log("GIF carregado (ok)")}
      />

      {/* Overlay semi-transparente para suavizar qualquer problema do GIF */}
      <div className="absolute inset-0 bg-black bg-opacity-10"></div>

      {/* Progress bar confiável */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-64 max-w-[80%] z-10">
        <div className="w-full bg-white bg-opacity-20 rounded-full h-1 mb-4">
          <div
            className="bg-white h-1 rounded-full transition-all ease-linear"
            style={{
              width: `${progress}%`,
              transition: "width 0.1s ease-out",
            }}
          />
        </div>

        {/* Indicador de tempo restante */}
        <div className="text-center">
          <p className="text-white text-xs opacity-60">
            {Math.ceil(
              (INTRO_DURATION - (progress * INTRO_DURATION) / 100) / 1000
            )}
            s
          </p>
        </div>
      </div>

      {/* Botão de skip sempre visível */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 px-4 py-2 bg-white bg-opacity-25 hover:bg-opacity-40 text-white text-sm font-medium rounded-full transition-all duration-200 z-10 border border-white border-opacity-20"
      >
        Pular
      </button>

      {/* Loading indicator sutil */}
      <div className="absolute top-6 left-6 z-10">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-white bg-opacity-60 rounded-full animate-pulse"></div>
          <div
            className="w-2 h-2 bg-white bg-opacity-60 rounded-full animate-pulse"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-2 h-2 bg-white bg-opacity-60 rounded-full animate-pulse"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default IntroVideo;
