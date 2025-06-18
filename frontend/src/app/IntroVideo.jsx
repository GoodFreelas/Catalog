import { useEffect, useRef, useState } from "react";
import { assets } from "../assets";

// Função para detectar se é mobile
const detectIsMobile = () =>
  /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    navigator.userAgent.toLowerCase()
  );

// Função para detectar Safari
const detectIsSafari = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return (
    userAgent.includes("safari") &&
    !userAgent.includes("chrome") &&
    !userAgent.includes("firefox")
  );
};

const IntroVideo = ({ onEnd, onSkip, isFinished }) => {
  const videoRef = useRef(null);
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);
  const [isFirefoxMobile, setIsFirefoxMobile] = useState(false);
  const [isMobile, setIsMobile] = useState(detectIsMobile());
  const [isSafari, setIsSafari] = useState(detectIsSafari());
  const [retryCount, setRetryCount] = useState(0);

  // Detecta Firefox Mobile
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isFirefox = userAgent.includes("firefox");
    const mobileDetected = detectIsMobile();
    const firefoxMobileDetected = isFirefox && mobileDetected;
    const safariDetected = detectIsSafari();

    setIsMobile(mobileDetected);
    setIsFirefoxMobile(firefoxMobileDetected);
    setIsSafari(safariDetected);

    if (firefoxMobileDetected) {
      setTimeout(() => {
        onEnd();
      }, 100);
    }
  }, [onEnd]);

  useEffect(() => {
    if (isFirefoxMobile) return;

    const video = videoRef.current;
    if (video) {
      video.addEventListener("loadeddata", () => {
        setVideoLoaded(true);
      });

      video.addEventListener("loadedmetadata", () => {
        // Tenta reproduzir assim que os metadados carregam
        if (isSafari) {
          attemptAutoplay();
        }
      });

      video.addEventListener("canplay", () => {
        // Tenta reproduzir quando o vídeo pode ser reproduzido
        if (!isSafari || retryCount < 2) {
          attemptAutoplay();
        }
      });

      video.addEventListener("error", (e) => {
        console.error("Erro ao carregar vídeo:", e);
        setVideoError(true);
        setTimeout(() => {
          onEnd();
        }, 1000);
      });

      const attemptAutoplay = () => {
        if (video.paused) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("Autoplay funcionou!");
                setNeedsUserInteraction(false);
              })
              .catch((error) => {
                console.warn("Autoplay bloqueado:", error);
                if (
                  error.name === "NotAllowedError" ||
                  error.name === "AbortError"
                ) {
                  setNeedsUserInteraction(true);

                  // Para Safari, tenta novamente após um pequeno delay
                  if (isSafari && retryCount < 3) {
                    setTimeout(() => {
                      setRetryCount((prev) => prev + 1);
                      attemptAutoplay();
                    }, 500);
                  }
                } else {
                  setVideoError(true);
                  setTimeout(() => {
                    onEnd();
                  }, 1000);
                }
              });
          }
        }
      };

      // Primeira tentativa de autoplay
      if (video.readyState >= 3) {
        // HAVE_FUTURE_DATA
        attemptAutoplay();
      }
    }
  }, [onEnd, isFirefoxMobile, isSafari, retryCount]);

  // Adiciona listeners para tentar autoplay em interações do usuário
  useEffect(() => {
    if (isSafari && needsUserInteraction) {
      const handleUserInteraction = () => {
        const video = videoRef.current;
        if (video && video.paused) {
          video
            .play()
            .then(() => {
              setNeedsUserInteraction(false);
              // Remove os listeners após sucesso
              document.removeEventListener("touchstart", handleUserInteraction);
              document.removeEventListener("click", handleUserInteraction);
              document.removeEventListener("scroll", handleUserInteraction);
            })
            .catch(console.error);
        }
      };

      // Adiciona múltiplos tipos de eventos para capturar qualquer interação
      document.addEventListener("touchstart", handleUserInteraction, {
        once: true,
        passive: true,
      });
      document.addEventListener("click", handleUserInteraction, { once: true });
      document.addEventListener("scroll", handleUserInteraction, {
        once: true,
        passive: true,
      });

      return () => {
        document.removeEventListener("touchstart", handleUserInteraction);
        document.removeEventListener("click", handleUserInteraction);
        document.removeEventListener("scroll", handleUserInteraction);
      };
    }
  }, [isSafari, needsUserInteraction]);

  const handleVideoEnd = () => {
    onEnd();
  };

  const handleSkip = () => {
    onSkip();
  };

  const handlePlayClick = () => {
    const video = videoRef.current;
    if (video) {
      video
        .play()
        .then(() => {
          setNeedsUserInteraction(false);
        })
        .catch((error) => {
          console.error("Erro ao reproduzir após interação:", error);
          setVideoError(true);
          setTimeout(() => {
            onEnd();
          }, 1000);
        });
    }
  };

  // Seleciona o vídeo apropriado baseado no dispositivo
  const getVideoSource = () => {
    return isMobile ? assets.intro : assets.introH;
  };

  if (isFirefoxMobile) {
    return null;
  }

  if (videoError) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="mb-4">Erro ao carregar vídeo</p>
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
      {/* Vídeo */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        onEnded={handleVideoEnd}
        muted
        playsInline
        webkit-playsinline="true"
        preload="auto" // Mudado de "metadata" para "auto" para melhor suporte no Safari
        controls={false}
        crossOrigin="anonymous"
        autoPlay // Adiciona o atributo autoPlay explicitamente
        loop={false}
      >
        <source
          src={getVideoSource()}
          type="video/mp4; codecs='avc1.42E01E, mp4a.40.2'"
        />
        <source src={getVideoSource()} type="video/mp4" />
        Seu navegador não suporta vídeos HTML5.
      </video>

      {/* Botão de play para quando autoplay é bloqueado */}
      {needsUserInteraction && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-center">
            <button
              onClick={handlePlayClick}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-6 rounded-full transition-all duration-200 mb-4"
            >
              <svg
                className="w-12 h-12"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            {isSafari && (
              <p className="text-white text-sm opacity-70">
                Toque em qualquer lugar da tela para iniciar
              </p>
            )}
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {!videoLoaded && !videoError && !needsUserInteraction && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
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
            <p className="text-white text-sm opacity-70">Carregando vídeo...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntroVideo;
