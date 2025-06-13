import { forwardRef } from "react";
import { AlertCircle } from "lucide-react";
import clsx from "clsx";

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      variant = "default",
      size = "md",
      fullWidth = false,
      className,
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      "border rounded-lg transition-all duration-200",
      "focus:outline-none focus:ring-2 focus:ring-offset-0",
      "disabled:opacity-50 disabled:cursor-not-allowed",
    ];

    const variants = {
      default: [
        "bg-white border-secondary-300 text-secondary-900",
        "placeholder-secondary-400",
        "hover:border-secondary-400",
        "focus:border-primary-500 focus:ring-primary-200",
      ],
      filled: [
        "bg-secondary-50 border-secondary-200 text-secondary-900",
        "placeholder-secondary-400",
        "hover:bg-secondary-100 hover:border-secondary-300",
        "focus:bg-white focus:border-primary-500 focus:ring-primary-200",
      ],
      error: [
        "bg-white border-error-300 text-secondary-900",
        "placeholder-secondary-400",
        "hover:border-error-400",
        "focus:border-error-500 focus:ring-error-200",
      ],
    };

    const sizes = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-3 text-base",
      lg: "px-4 py-4 text-lg",
    };

    const inputVariant = error ? "error" : variant;

    const inputClasses = clsx(
      baseClasses,
      variants[inputVariant],
      sizes[size],
      {
        "w-full": fullWidth,
        "pl-10": leftIcon,
        "pr-10": rightIcon,
      },
      className
    );

    return (
      <div className={clsx("space-y-1", { "w-full": fullWidth })}>
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-secondary-700">
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400">
              {typeof leftIcon === "string" ? (
                <span>{leftIcon}</span>
              ) : (
                leftIcon
              )}
            </div>
          )}

          {/* Input */}
          <input ref={ref} className={inputClasses} {...props} />

          {/* Right Icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400">
              {typeof rightIcon === "string" ? (
                <span>{rightIcon}</span>
              ) : (
                rightIcon
              )}
            </div>
          )}

          {/* Error Icon */}
          {error && !rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-error-500">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Helper Text / Error */}
        {(helperText || error) && (
          <div
            className={clsx(
              "text-sm",
              error ? "text-error-600" : "text-secondary-600"
            )}
          >
            {error || helperText}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
