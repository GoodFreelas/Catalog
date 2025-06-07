import React, { forwardRef } from "react";

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      onRightIconClick,
      className = "",
      containerClassName = "",
      ...props
    },
    ref
  ) => {
    const inputClasses = `
    w-full px-3 py-2 border rounded-md
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    ${LeftIcon ? "pl-10" : ""}
    ${RightIcon ? "pr-10" : ""}
    ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300"}
    ${className}
  `
      .trim()
      .replace(/\s+/g, " ");

    return (
      <div className={`space-y-1 ${containerClassName}`}>
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {LeftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LeftIcon size={20} className="text-gray-400" />
            </div>
          )}

          {/* Input Field */}
          <input ref={ref} className={inputClasses} {...props} />

          {/* Right Icon */}
          {RightIcon && (
            <div
              className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                onRightIconClick ? "cursor-pointer" : "pointer-events-none"
              }`}
              onClick={onRightIconClick}
            >
              <RightIcon
                size={20}
                className={`${
                  onRightIconClick
                    ? "text-gray-600 hover:text-gray-800"
                    : "text-gray-400"
                }`}
              />
            </div>
          )}
        </div>

        {/* Helper Text / Error */}
        {(error || helperText) && (
          <p className={`text-sm ${error ? "text-red-600" : "text-gray-500"}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
