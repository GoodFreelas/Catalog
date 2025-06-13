import clsx from "clsx";

const Badge = ({
  children,
  variant = "default",
  size = "md",
  rounded = "md",
  className,
  ...props
}) => {
  const baseClasses = [
    "inline-flex items-center font-medium",
    "transition-colors duration-200",
  ];

  const variants = {
    default: "bg-secondary-100 text-secondary-800",
    primary: "bg-primary-100 text-primary-800",
    secondary: "bg-secondary-100 text-secondary-800",
    success: "bg-success-100 text-success-800",
    warning: "bg-warning-100 text-warning-800",
    error: "bg-error-100 text-error-800",

    // Solid variants
    "primary-solid": "bg-primary-600 text-white",
    "secondary-solid": "bg-secondary-600 text-white",
    "success-solid": "bg-success-600 text-white",
    "warning-solid": "bg-warning-600 text-white",
    "error-solid": "bg-error-600 text-white",

    // Outline variants
    "primary-outline":
      "border border-primary-300 text-primary-700 bg-transparent",
    "secondary-outline":
      "border border-secondary-300 text-secondary-700 bg-transparent",
    "success-outline":
      "border border-success-300 text-success-700 bg-transparent",
    "warning-outline":
      "border border-warning-300 text-warning-700 bg-transparent",
    "error-outline": "border border-error-300 text-error-700 bg-transparent",
  };

  const sizes = {
    xs: "px-2 py-0.5 text-xs",
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  const roundedSizes = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  const classes = clsx(
    baseClasses,
    variants[variant],
    sizes[size],
    roundedSizes[rounded],
    className
  );

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};

export default Badge;
