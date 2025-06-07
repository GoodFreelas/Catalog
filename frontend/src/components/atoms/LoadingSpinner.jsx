import React from 'react';

export const LoadingSpinner = ({
  size = 'md',
  color = 'blue',
  className = '',
  text = '',
  fullScreen = false
}) => {
  const sizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colors = {
    blue: 'border-blue-600',
    green: 'border-green-600',
    red: 'border-red-600',
    yellow: 'border-yellow-600',
    purple: 'border-purple-600',
    gray: 'border-gray-600'
  };

  const spinnerClasses = [
    'animate-spin rounded-full border-2 border-t-transparent',
    sizes[size] || sizes.md,
    colors[color] || colors.blue,
    className
  ].join(' ');

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50'
    : 'flex items-center justify-center py-8';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-3">
        <div className={spinnerClasses}></div>
        {text && (
          <p className="text-sm text-gray-600 animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

// Componente de loading para texto inline
export const LoadingDots = ({ className = '' }) => {
  return (
    <span className={`inline-flex space-x-1 ${className}`}>
      <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
      <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
      <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
    </span>
  );
};

// Componente de skeleton loading
export const SkeletonLoader = ({ className = '', lines = 3 }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {[...Array(lines)].map((_, index) => (
        <div
          key={index}
          className="h-4 bg-gray-200 rounded mb-2 last:mb-0"
          style={{ width: `${100 - Math.random() * 30}%` }}
        ></div>
      ))}
    </div>
  );
};