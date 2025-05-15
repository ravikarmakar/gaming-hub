import React from "react";
import { Eye, EyeOff } from "lucide-react";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  label: string;
  icon: React.ReactNode;
  error?: string | null;
  name: string;
  autocomplete?: string;
}

export const AuthInput = ({
  value,
  label,
  icon,
  error = null,
  onChange,
  type = "text",
  ...props
}: AuthInputProps) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  const inputType = type === "password" && showPassword ? "text" : type;

  return (
    <div className="space-y-2">
      <label
        htmlFor={props.id || props.name}
        className="block text-sm font-medium text-gray-300"
      >
        {label}
      </label>
      <div
        className={`relative group rounded-lg ${
          isFocused ? "ring-2 ring-cyan-500 ring-opacity-50" : ""
        }`}
      >
        <div
          className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
            isFocused ? "text-cyan-400" : "text-gray-400"
          }`}
        >
          {icon}
        </div>
        <input
          id={props.id || props.name}
          value={value}
          onChange={onChange}
          type={inputType}
          className={`w-full pl-10 pr-10 py-3 bg-gray-800/50 border rounded-lg transition-all duration-300 outline-none ${
            error
              ? "border-red-500"
              : isFocused
              ? "border-cyan-500"
              : "border-gray-700"
          } text-white placeholder-gray-400 focus:shadow-[0_0_20px_rgba(6,182,212,0.15)]`}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.name}-error` : undefined}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
              isFocused ? "text-cyan-400" : "text-gray-400"
            } hover:text-cyan-300`}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p
          id={`${props.name}-error`}
          className="text-sm text-red-500 flex items-center gap-1"
        >
          <span className="inline-block w-1 h-1 bg-red-500 rounded-full animate-pulse" />
          {error}
        </p>
      )}
    </div>
  );
};
