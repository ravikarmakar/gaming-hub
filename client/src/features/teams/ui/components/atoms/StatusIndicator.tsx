import React from 'react';

interface StatusIndicatorProps {
    isActive: boolean;
    label?: string;
    className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
    isActive, 
    label,
    className = "" 
}) => {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
                isActive 
                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" 
                    : "bg-gray-600 shadow-none"
            }`} />
            {label && (
                <span className={`text-xs font-bold uppercase tracking-widest ${
                    isActive ? "text-emerald-500" : "text-gray-500"
                }`}>
                    {label}
                </span>
            )}
        </div>
    );
};
