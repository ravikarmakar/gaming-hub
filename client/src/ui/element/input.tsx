import React, { useState } from "react";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  label: string;
  icon: React.ReactNode;
  error?: string[] | null;
  name: string;
  autoComplete?: string;
  className?: string;
  hint?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Input = ({
  value,
  label,
  icon,
  error = null,
  onChange,
  type = "text",
  hint,
  ...props
}: AuthInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  // const [isTouched, setIsTouched] = useState(false);

  const inputType = type === "password" && showPassword ? "text" : type;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={props.id || props.name}
          className="block text-sm font-medium text-gray-200"
        >
          {label}
        </label>

        {hint && (
          <span className="text-xs text-gray-400 transition-colors duration-200 group-hover:text-gray-300">
            {hint}
          </span>
        )}
      </div>

      <div className="relative group">
        {/* Gradient border effect */}
        <div
          className={`
            absolute -inset-0.5 rounded-lg blur-sm opacity-0 transition-opacity duration-300
            ${isFocused ? "opacity-50" : "group-hover:opacity-20"}
            bg-gradient-to-r from-purple-600 to-blue-600
          `}
        ></div>

        {/* Input container */}
        <div
          className={`
            relative bg-gray-900/80 rounded-lg overflow-hidden
            ${
              error
                ? "border border-red-500/50"
                : "border border-gray-700 group-hover:border-gray-600"
            }
            ${
              isFocused
                ? "border-purple-500/70 shadow-[0_0_10px_rgba(168,85,247,0.15)]"
                : ""
            }
            transition-all duration-300
          `}
        >
          <div
            className={`
              absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none
              ${
                isFocused
                  ? "text-purple-400"
                  : "text-gray-500 group-hover:text-gray-400"
              }
              transition-colors duration-300
            `}
          >
            {icon}
          </div>

          <input
            id={props.id || props.name}
            value={value}
            onChange={onChange}
            type={inputType}
            className={`
              w-full pl-10 pr-10 py-2.5 text-base bg-transparent rounded-lg 
              transition-all duration-300 outline-none
              text-white placeholder-gray-500
              focus:placeholder-gray-400
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            aria-invalid={!!error}
            aria-describedby={error ? `${props.name}-error` : undefined}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
            }}
            {...props}
          />

          {type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`
                absolute inset-y-0 right-0 pr-3 flex items-center
                ${isFocused ? "text-purple-400" : "text-gray-500"}
                hover:text-purple-300 transition-colors duration-200
              `}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
      </div>

      {/* Error message with animation */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-1 space-y-1"
          >
            {error.map((errMsg, index) => (
              <p
                key={index}
                id={`${props.name}-error-${index}`}
                className="flex items-center gap-1.5 text-xs text-red-400"
                role="alert"
              >
                <AlertTriangle size={12} className="flex-shrink-0" />
                <span>{errMsg}</span>
              </p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Input;
