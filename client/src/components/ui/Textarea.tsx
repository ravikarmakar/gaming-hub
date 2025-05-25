import React from "react";
import { FileText } from "lucide-react";

interface GlowingTextareaProps {
  id: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  errors?: string | null;
  className?: string;
}

export const Textarea: React.FC<GlowingTextareaProps> = ({
  id,
  name,
  value,
  onChange,
  placeholder = "",
  rows = 4,
  errors = null,
  className = "",
}) => {
  const isInvalid = !!errors;
  const ariaDescribedBy = isInvalid ? `${id}-error` : undefined;

  return (
    <div className={`relative group ${className}`}>
      {/* Glowing border effect */}
      <div
        className={`
          absolute -inset-0.5 rounded-lg blur-sm opacity-20 group-hover:opacity-30
          bg-gradient-to-r from-purple-600 to-blue-600 transition-opacity duration-300
        `}
        // Optionally add a subtle pulse if there's an error
        // You'd need to define `animate-pulse` in your CSS or Tailwind config
        // or use Framer Motion for more complex animations.
        // ${isInvalid ? 'animate-pulse' : ''}
      ></div>

      {/* Main textarea container with border and icon */}
      <div className="relative transition-all duration-300 border border-gray-700 rounded-lg bg-gray-900/80 group-hover:border-gray-600">
        {/* Icon inside the textarea */}
        <div className="absolute inset-y-0 left-0 pl-3 pt-2.5 pointer-events-none text-gray-500 group-hover:text-gray-400">
          <FileText size={18} />
        </div>

        {/* The textarea element */}
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          rows={rows}
          className="w-full pl-10 pr-3 py-2.5 text-base bg-transparent rounded-lg
            outline-none transition-all duration-300
            text-white placeholder-gray-500 focus:placeholder-gray-400"
          placeholder={placeholder}
          aria-invalid={isInvalid}
          aria-describedby={ariaDescribedBy}
        />
      </div>

      {/* Optional error message display */}
      {isInvalid && (
        <p id={`${id}-error`} className="mt-2 text-sm text-red-500">
          {errors}
        </p>
      )}
    </div>
  );
};
