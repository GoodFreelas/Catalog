import { useEffect, useRef, useState } from "react";
import { assets } from "../assets";

// Função para detectar se é mobile
const detectIsMobile = () =>
  /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    navigator.userAgent.toLowerCase()
  );

const IntroVideo = ({ onEnd, onSkip, isFinished }) => {
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

    console.log("🏁 Finalizando intro");
    setHasFinished(true);

    // Limpa timers
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    onEnd();
  };

  // Effect principal - sempre recomeça do zero
  useEffect(() => {
    console.log("🚀 Intro montado - iniciando do zero");

    // Força reset de todos os estados
    setProgress(0);
    setTimeLeft(isMobile ? 3 : 5);
    setHasFinished(false);

    // Pequeno delay para garantir que o reset aconteceu
    const initDelay = setTimeout(() => {
      const startTime = Date.now();

      console.log("⏰ Timer iniciado");

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
        console.log("⏰ Timeout de segurança");
        finish();
      }, DURATION + 500);
    }, 50); // 50ms de delay para garantir reset

    // Cleanup
    return () => {
      console.log("🧹 Limpando timers");
      clearTimeout(initDelay);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []); // Array vazio - mas componente é re-montado pela key

  // Handler para skip
  const handleSkip = () => {
    console.log("⏭️ Skip clicado");
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

      {/* Progress bar */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-80 max-w-[90%]">
        <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mb-3">
          <div
            className="bg-white h-2 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-white text-center text-sm opacity-80">
          {timeLeft}s restantes
        </p>
      </div>

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
