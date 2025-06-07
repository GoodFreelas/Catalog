import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center rounded-full font-medium';

  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-600',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-cyan-100 text-cyan-800',
    dark: 'bg-gray-800 text-white',
    light: 'bg-white text-gray-800 border border-gray-200'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base'
  };

  const badgeClasses = [
    baseClasses,
    variants[variant] || variants.default,
    sizes[size] || sizes.md,
    className
  ].join(' ');

  return (
    <span className={badgeClasses} {...props}>
      {children}
    </span>
  );
};