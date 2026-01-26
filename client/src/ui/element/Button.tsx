import React, { useState } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "register" | "auth"; // Added 'auth' variant
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button = ({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: ButtonProps) => {
  const baseStyles =
    "relative overflow-hidden transition-all duration-300 font-semibold rounded-xl";
  const variants = {
    primary:
      "bg-cyan-500 hover:bg-cyan-600 text-white before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700",
    secondary:
      "bg-purple-600 hover:bg-purple-700 text-white before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700",
    register:
      "bg-gradient-to-r from-gray-700 via-gray-800 to-black text-green-400 hover:text-green-300 hover:from-gray-600 hover:via-gray-700 hover:to-black before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-green-400/20 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700",
    auth: "bg-cyan-500 hover:bg-cyan-600 text-white border border-transparent rounded-md focus:ring-2 focus:ring-cyan-300 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-cyan-500/20 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700",
  };
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface GlowButtonProps {
  readonly children: React.ReactNode;
  readonly variant?: "primary" | "secondary" | "ghost" | "danger";
  readonly size?: "sm" | "md" | "lg";
  readonly onClick?: () => void;
  readonly className?: string;
  readonly disabled?: boolean;
}

const useHover = () => {
  const [isHovered, setIsHovered] = useState(false);
  return {
    isHovered,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  };
};

export const GlowButton: React.FC<GlowButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  onClick,
  className = "",
  disabled = false,
}) => {
  const hoverProps = useHover();

  const baseClasses =
    "relative font-medium transition-all duration-300 group overflow-hidden rounded-xl";
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white shadow-lg hover:shadow-2xl hover:shadow-blue-500/25",
    secondary:
      "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 hover:border-gray-600",
    ghost:
      "bg-transparent hover:bg-gray-800/50 text-gray-300 hover:text-white border border-gray-700/50 hover:border-gray-600",
    danger:
      "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 text-white shadow-lg hover:shadow-2xl hover:shadow-red-500/25",
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]
        } ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={hoverProps.onMouseEnter}
      onMouseLeave={hoverProps.onMouseLeave}
    >
      {(variant === "primary" || variant === "danger") && (
        <div
          className={`absolute inset-0 bg-gradient-to-r ${variant === "primary"
            ? "from-blue-400 to-purple-500"
            : "from-red-400 to-pink-500"
            } opacity-0 transition-opacity duration-300 ${hoverProps.isHovered ? "opacity-20" : ""
            }`}
        />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      {(variant === "primary" || variant === "danger") && (
        <div className="absolute inset-0 transition-transform duration-1000 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full" />
      )}
    </button>
  );
};
