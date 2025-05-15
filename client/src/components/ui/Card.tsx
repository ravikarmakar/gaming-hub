import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card = ({ children, className = "", hover = true }: CardProps) => {
  const baseStyles =
    "bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800";
  const hoverStyles = hover
    ? "hover:scale-[1.02] hover:border-cyan-500/50 transition-all duration-300"
    : "";

  return (
    <div className={`${baseStyles} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
};
