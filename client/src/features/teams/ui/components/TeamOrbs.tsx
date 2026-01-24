import React from 'react';

export const TeamOrbs: React.FC = () => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Primary Purple Orb */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" />

            {/* Secondary Blue Orb */}
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />

            {/* Accent Pink Orb */}
            <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-pink-600/10 blur-[100px] rounded-full animate-pulse [animation-delay:4s]" />

            {/* Center Subtle Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-purple-900/5 blur-[150px] rounded-full pointer-events-none" />
        </div>
    );
};
