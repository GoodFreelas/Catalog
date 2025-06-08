import React from "react";

const Loading = ({
  size = "medium",
  text = "",
  centered = false,
  className = "",
}) => {
  const sizes = {
    small: "h-4 w-4",
    medium: "h-8 w-8",
    large: "h-12 w-12",
  };

  const containerClasses = centered
    ? "flex flex-col items-center justify-center min-h-[200px]"
    : "flex items-center";

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className={`loading-spinner ${sizes[size]}`}></div>
      {text && <p className="mt-2 text-sm text-gray-600">{text}</p>}
    </div>
  );
};

// Skeleton para carregamento de cards
export const ProductSkeleton = () => {
  return (
    <div className="card p-4 animate-pulse">
      <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
      <div className="h-4 bg-gray-300 rounded mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
      <div className="h-6 bg-gray-300 rounded w-1/2"></div>
    </div>
  );
};

// Grid de skeletons
export const ProductGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="product-grid">
      {Array.from({ length: count }).map((_, index) => (
        <ProductSkeleton key={index} />
      ))}
    </div>
  );
};

export default Loading;
