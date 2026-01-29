import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string[];
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, icon, error, id, name, ...props }, ref) => {
    const inputId = id || name;
    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-gray-200">
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute text-gray-400 transition-colors duration-200 transform -translate-y-1/2 left-3 top-1/2 group-focus-within:text-purple-400">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            name={name}
            type={type}
            className={cn(
              // Base styles
              "flex h-9 w-full rounded-lg border px-3 py-1.5 text-sm transition-all duration-200",
              // Background and text
              "bg-gray-900/50 text-gray-100 placeholder:text-gray-500",
              // Border styles
              "border-gray-700/50",
              // Focus styles
              "focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50",
              // Hover styles
              "hover:border-gray-600/50",
              // Icon padding
              icon && "pl-10",
              // Error styles
              error && error.length > 0 && "border-red-500/50 focus:ring-red-500/50 focus:border-red-500",
              // Disabled styles
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-900/30",
              // File input styles
              "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-gray-100",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && error.length > 0 && (
          <p className="flex items-center gap-1 text-xs text-red-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3 h-3"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            {error[0]}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
