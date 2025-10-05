// React & React Hooks
import { useEffect, useRef, useState } from 'react';

// Assets
import { assets } from '../assets';

// Types
import { IntroVideoProps } from '../types/components';

// ================================
// Helper Functions
// ================================

/**
 * Detecta se o dispositivo é mobile baseado no user agent
 */
const detectIsMobile = (): boolean =>
  /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    navigator.userAgent.toLowerCase()
  );

// ================================
// Main Component
// ================================

/**
 * Componente de vídeo introdutório com timer e opção de pular.
 * Mostra uma animação GIF e permite ao usuário pular ou aguardar o término.
 */
const IntroVideo: React.FC<IntroVideoProps> = ({ onEnd, onSkip, isFinished }) => {
  const [isMobile] = useState(detectIsMobile());

  // Estados que sempre resetam
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(isMobile ? 3 : 5);
  const [hasFinished, setHasFinished] = useState(false);

  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const DURATION = isMobile ? 3000 : 5000;

  // Função para finalizar (só executa uma vez por instância)
  const finish = () => {
    if (hasFinished) return;

    setHasFinished(true);

    // Limpa timers
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    onEnd();
  };

  // Effect principal - sempre recomeça do zero
  useEffect(() => {
    // Força reset de todos os estados
    setProgress(0);
    setTimeLeft(isMobile ? 3 : 5);
    setHasFinished(false);

    // Pequeno delay para garantir que o reset aconteceu
    const initDelay = setTimeout(() => {
      const startTime = Date.now();

      // Timer de progresso
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / DURATION) * 100, 100);
        const newTimeLeft = Math.ceil((DURATION - elapsed) / 1000);

        setProgress(newProgress);
        setTimeLeft(Math.max(0, newTimeLeft));

        if (newProgress >= 100) {
          finish();
        }
      }, 100);

      // Timeout de segurança
      timeoutRef.current = setTimeout(() => {
        finish();
      }, DURATION + 500);
    }, 50); // 50ms de delay para garantir reset

    // Cleanup
    return () => {
      clearTimeout(initDelay);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []); // Array vazio - mas componente é re-montado pela key

  // Handler para skip
  const handleSkip = () => {
    finish();
    if (onSkip && onSkip !== onEnd) {
      onSkip();
    }
  };

  // Se já terminou ou foi marcado como finalizado pelo parent, não renderiza
  if (isFinished || hasFinished) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* GIF */}
      <img
        src={isMobile ? assets.intro : assets.introH}
        alt="Intro Animation"
        className="w-full h-full object-cover"
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "cover",
        }}
        loading="eager"
      />

      {/* Botão skip */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-sm rounded-full transition-opacity duration-200"
      >
        Pular
      </button>
    </div>
  );
};

export default IntroVideo;
