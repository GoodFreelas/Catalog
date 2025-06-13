import { useState } from "react";
import { ImageIcon } from "lucide-react";
import clsx from "clsx";

const Image = ({
  src,
  alt = "",
  fallback = null,
  aspectRatio = "square",
  objectFit = "cover",
  placeholder = true,
  className,
  onLoad,
  onError,
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const aspectRatios = {
    square: "aspect-square",
    video: "aspect-video",
    "4/3": "aspect-[4/3]",
    "3/2": "aspect-[3/2]",
    "16/9": "aspect-[16/9]",
    "2/1": "aspect-[2/1]",
    "1/1": "aspect-square",
  };

  const objectFits = {
    contain: "object-contain",
    cover: "object-cover",
    fill: "object-fill",
    "scale-down": "object-scale-down",
    none: "object-none",
  };

  const handleLoad = (e) => {
    setLoading(false);
    onLoad?.(e);
  };

  const handleError = (e) => {
    setLoading(false);
    setError(true);
    onError?.(e);
  };

  const containerClasses = clsx(
    "relative overflow-hidden bg-secondary-100",
    aspectRatios[aspectRatio] || aspectRatio,
    className
  );

  const imageClasses = clsx(
    "w-full h-full transition-opacity duration-300",
    objectFits[objectFit],
    {
      "opacity-0": loading,
      "opacity-100": !loading && !error,
    }
  );

  // Placeholder durante carregamento
  const Placeholder = () => (
    <div
      className={clsx(
        "absolute inset-0 flex items-center justify-center bg-secondary-100",
        loading ? "animate-pulse" : ""
      )}
    >
      <ImageIcon className="w-8 h-8 text-secondary-400" />
    </div>
  );

  // Fallback personalizado ou padrão
  const Fallback = () => {
    if (fallback) {
      return typeof fallback === "function" ? fallback() : fallback;
    }

    return (
      <div className="absolute inset-0 flex items-center justify-center bg-secondary-100">
        <div className="text-center text-secondary-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-2" />
          <p className="text-sm">Imagem não disponível</p>
        </div>
      </div>
    );
  };

  return (
    <div className={containerClasses} {...props}>
      {/* Placeholder durante carregamento */}
      {loading && placeholder && <Placeholder />}

      {/* Imagem principal */}
      {src && !error && (
        <img
          src={src}
          alt={alt}
          className={imageClasses}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}

      {/* Fallback quando há erro */}
      {error && <Fallback />}
    </div>
  );
};

export default Image;
