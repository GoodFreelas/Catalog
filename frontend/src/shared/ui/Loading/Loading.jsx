import { Loader2 } from "lucide-react";
import clsx from "clsx";

const Loading = ({
  size = "md",
  variant = "spinner",
  text = "",
  center = false,
  fullScreen = false,
  className,
  ...props
}) => {
  const sizes = {
    xs: "w-4 h-4",
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const Spinner = () => (
    <Loader2 className={clsx("animate-spin text-primary-600", sizes[size])} />
  );

  const Dots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={clsx(
            "bg-primary-600 rounded-full animate-pulse",
            size === "xs" && "w-1 h-1",
            size === "sm" && "w-1.5 h-1.5",
            size === "md" && "w-2 h-2",
            size === "lg" && "w-3 h-3",
            size === "xl" && "w-4 h-4"
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: "1s",
          }}
        />
      ))}
    </div>
  );

  const Pulse = () => (
    <div
      className={clsx("bg-primary-600 rounded-full animate-pulse", sizes[size])}
    />
  );

  const renderLoader = () => {
    switch (variant) {
      case "dots":
        return <Dots />;
      case "pulse":
        return <Pulse />;
      case "spinner":
      default:
        return <Spinner />;
    }
  };

  const containerClasses = clsx(
    "flex items-center gap-3",
    {
      "justify-center": center,
      "fixed inset-0 bg-white/80 backdrop-blur-sm z-50": fullScreen,
      "flex-col": text && (center || fullScreen),
    },
    className
  );

  return (
    <div className={containerClasses} {...props}>
      {renderLoader()}
      {text && (
        <span
          className={clsx(
            "text-secondary-600 font-medium",
            size === "xs" && "text-xs",
            size === "sm" && "text-sm",
            size === "md" && "text-base",
            size === "lg" && "text-lg",
            size === "xl" && "text-xl"
          )}
        >
          {text}
        </span>
      )}
    </div>
  );
};

export default Loading;
