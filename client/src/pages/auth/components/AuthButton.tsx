import React from "react";

interface AuthButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
}

export const AuthButton = ({
  children,
  isLoading,
  ...props
}: AuthButtonProps) => {
  return (
    <button
      className={`
        w-full py-3 px-4 rounded-lg font-medium
        bg-gradient-to-r from-cyan-400 via-purple-600 to-cyan-500
        bg-300% animate-gradient
        hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]
        text-white transition-all duration-300
        transform hover:scale-[1.02] active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed
        relative overflow-hidden group
      `}
      disabled={isLoading}
      {...props}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Processing...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};
