import { useEffect, useRef, useState } from "react";

const IntroVideo = ({ onEnd, onSkip, isFinished }) => {
  const videoRef = useRef(null);
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Adiciona listeners para debug
      video.addEventListener("loadeddata", () => {
        console.log("Vídeo carregado com sucesso");
        setVideoLoaded(true);
      });

      video.addEventListener("error", (e) => {
        console.error("Erro ao carregar vídeo:", e);
        setVideoError(true);
        // Pula automaticamente se houver erro
        setTimeout(() => {
          onEnd();
        }, 1000);
      });

      // Tenta reproduzir o vídeo
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Vídeo iniciado com sucesso");
          })
          .catch((error) => {
            console.error("Erro ao reproduzir vídeo:", error);
            setVideoError(true);
            // Pula automaticamente se não conseguir reproduzir
            setTimeout(() => {
              onEnd();
            }, 1000);
          });
      }
    }
  }, [onEnd]);

  const handleVideoEnd = () => {
    onEnd();
  };

  const handleSkip = () => {
    onSkip();
  };

  // Se houver erro, mostra por 1 segundo e depois sai
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
        preload="auto"
        controls={false}
      >
        <source src="/src/assets/intro.mp4" type="video/mp4" />
        <source src="src/assets/intro.mp4" type="video/mp4" />
        Seu navegador não suporta vídeos HTML5.
      </video>

      {/* Loading indicator - só mostra se o vídeo não carregou ainda */}
      {!videoLoaded && !videoError && (
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
