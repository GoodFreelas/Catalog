import { useEffect, useRef, useState } from "react";
import { assets } from "../assets";

// Função para detectar se é mobile
const detectIsMobile = () =>
  /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    navigator.userAgent.toLowerCase()
  );

const IntroVideo = ({ onEnd, onSkip, isFinished }) => {
  const videoRef = useRef(null);
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);
  const [isFirefoxMobile, setIsFirefoxMobile] = useState(false);
  const [isMobile, setIsMobile] = useState(detectIsMobile()); // detecta logo no início

  // Detecta Firefox Mobile
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isFirefox = userAgent.includes("firefox");
    const mobileDetected = detectIsMobile();
    const firefoxMobileDetected = isFirefox && mobileDetected;

    setIsMobile(mobileDetected);
    setIsFirefoxMobile(firefoxMobileDetected);

    if (firefoxMobileDetected) {
      console.log("Firefox Mobile detectado - pulando vídeo de introdução");
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
        console.log("Vídeo carregado com sucesso");
        setVideoLoaded(true);
      });

      video.addEventListener("canplay", () => {
        console.log("Vídeo pronto para reproduzir");
      });

      video.addEventListener("error", (e) => {
        console.error("Erro ao carregar vídeo:", e);
        setVideoError(true);
        setTimeout(() => {
          onEnd();
        }, 1000);
      });

      video.addEventListener("loadstart", () => {
        console.log("Iniciando carregamento do vídeo");
      });

      const attemptAutoplay = () => {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Vídeo iniciado automaticamente");
            })
            .catch((error) => {
              console.warn("Autoplay bloqueado:", error);
              if (
                error.name === "NotAllowedError" ||
                error.name === "AbortError"
              ) {
                setNeedsUserInteraction(true);
              } else {
                setVideoError(true);
                setTimeout(() => {
                  onEnd();
                }, 1000);
              }
            });
        }
      };

      attemptAutoplay();
    }
  }, [onEnd, isFirefoxMobile]);

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
        preload="metadata"
        controls={false}
        crossOrigin="anonymous"
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
          <button
            onClick={handlePlayClick}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-6 rounded-full transition-all duration-200"
          >
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
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
