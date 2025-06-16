import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      className,
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      "inline-flex items-center justify-center font-medium rounded-lg",
      "transition-all duration-200 ease-in-out",
      "focus:outline-none focus:ring-2 focus:ring-offset-2",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      "active:scale-[0.98]",
    ];

    const variants = {
      primary: [
        "bg-primary-600 text-white shadow-sm",
        "hover:bg-primary-700 hover:shadow-md",
        "focus:ring-primary-500",
        "disabled:hover:bg-primary-600",
      ],
      secondary: [
        "bg-secondary-100 text-secondary-900 border border-secondary-200",
        "hover:bg-secondary-200 hover:border-secondary-300",
        "focus:ring-secondary-500",
        "disabled:hover:bg-secondary-100",
      ],
      outline: [
        "bg-transparent border-2 border-primary-600 text-primary-600",
        "hover:bg-primary-50 hover:border-primary-700 hover:text-white",
        "focus:ring-primary-500",
        "disabled:hover:bg-transparent disabled:hover:border-primary-600",
      ],
      ghost: [
        "bg-transparent text-secondary-700",
        "hover:bg-secondary-100 hover:text-secondary-900",
        "focus:ring-secondary-500",
        "disabled:hover:bg-transparent",
      ],
      success: [
        "bg-success-600 text-white shadow-sm",
        "hover:bg-success-700 hover:shadow-md",
        "focus:ring-success-500",
        "disabled:hover:bg-success-600",
      ],
      warning: [
        "bg-warning-600 text-white shadow-sm",
        "hover:bg-warning-700 hover:shadow-md",
        "focus:ring-warning-500",
        "disabled:hover:bg-warning-600",
      ],
      error: [
        "bg-error-600 text-white shadow-sm",
        "hover:bg-error-700 hover:shadow-md",
        "focus:ring-error-500",
        "disabled:hover:bg-error-600",
      ],
    };

    const sizes = {
      xs: "px-2.5 py-1.5 text-xs gap-1",
      sm: "px-3 py-2 text-sm gap-1.5",
      md: "px-4 py-2.5 text-sm gap-2",
      lg: "px-6 py-3 text-base gap-2",
      xl: "px-8 py-4 text-lg gap-2.5",
    };

    const classes = clsx(
      baseClasses,
      variants[variant],
      sizes[size],
      {
        "w-full": fullWidth,
        "pointer-events-none": loading || disabled,
      },
      className
    );

    const iconSize = {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
    };

    const LoadingIcon = () => (
      <Loader2 size={iconSize[size]} className="animate-spin" />
    );

    const LeftIcon =
      leftIcon && !loading ? (
        typeof leftIcon === "string" ? (
          <span className="text-current">{leftIcon}</span>
        ) : (
          <leftIcon.type {...leftIcon.props} size={iconSize[size]} />
        )
      ) : null;

    const RightIcon =
      rightIcon && !loading ? (
        typeof rightIcon === "string" ? (
          <span className="text-current">{rightIcon}</span>
        ) : (
          <rightIcon.type {...rightIcon.props} size={iconSize[size]} />
        )
      ) : null;

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <LoadingIcon />}
        {!loading && LeftIcon}

        {children && (
          <span
            className={clsx({
              "opacity-0": loading && !LeftIcon && !RightIcon,
            })}
          >
            {children}
          </span>
        )}

        {!loading && RightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
