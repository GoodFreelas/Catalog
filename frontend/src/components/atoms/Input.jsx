import React from 'react';

export const Input = ({
  placeholder = '',
  value,
  onChange,
  className = '',
  type = 'text',
  disabled = false,
  error = false,
  errorMessage = '',
  label = '',
  required = false,
  ...props
}) => {
  const baseClasses = 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors';

  const stateClasses = error
    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';

  const disabledClasses = disabled
    ? 'bg-gray-100 cursor-not-allowed opacity-60'
    : 'bg-white hover:border-gray-400';

  const inputClasses = [
    baseClasses,
    stateClasses,
    disabledClasses,
    className
  ].join(' ');

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={inputClasses}
        {...props}
      />

      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-600">
          {errorMessage}
        </p>
      )}
    </div>
  );
};