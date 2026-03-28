import React from "react";

interface ArenaLoadingProps {
    message?: string;
}

export const ArenaLoading: React.FC<ArenaLoadingProps> = ({
    message = "Accessing Arena Protocol...",
}) => {
    return (
        <div 
            className="flex items-center justify-center min-h-screen bg-brand-black"
            role="status"
            aria-live="polite"
        >
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-4" aria-hidden="true" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">{message}</p>
            </div>
        </div>
    );
};

export default ArenaLoading;
