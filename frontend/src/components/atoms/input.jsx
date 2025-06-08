import React from "react";

const Input = ({
  type = "text",
  placeholder = "",
  value,
  onChange,
  disabled = false,
  error = false,
  className = "",
  icon: Icon,
  ...props
}) => {
  const baseClasses =
    "w-full px-3 py-2 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0";

  const statusClasses = error
    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
    : "border-gray-300 focus:border-primary-500 focus:ring-primary-500";

  const disabledClasses = disabled
    ? "bg-gray-100 cursor-not-allowed"
    : "bg-white";

  const classes = `${baseClasses} ${statusClasses} ${disabledClasses} ${className}`;

  if (Icon) {
    return (
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`${classes} pl-10`}
          {...props}
        />
      </div>
    );
  }

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={classes}
      {...props}
    />
  );
};

export default Input;
