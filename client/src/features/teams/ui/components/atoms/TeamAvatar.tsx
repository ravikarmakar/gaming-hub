import React from 'react';
import { User, Shield } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TeamAvatarProps {
    src?: string;
    alt: string;
    role?: string;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export const TeamAvatar: React.FC<TeamAvatarProps> = ({ 
    src, 
    alt, 
    role, 
    size = "md",
    className = "" 
}) => {
    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-14 h-14",
        lg: "w-20 h-20"
    };

    return (
        <div 
            className={`relative ${className}`}
            role="img"
            aria-label={role === 'igl' ? `${alt} (In-Game Leader)` : alt}
        >
            <div className={`${sizeClasses[size]} rounded-xl bg-zinc-800 border-2 border-white/5 overflow-hidden shadow-lg group-hover:shadow-purple-500/20 transition-all duration-300`}>
                <Avatar className="w-full h-full">
                    <AvatarImage src={src} alt={alt} className="object-cover" />
                    <AvatarFallback className="bg-zinc-800 text-gray-400">
                        {alt.substring(0, 2).toUpperCase() || <User size={size === "sm" ? 14 : 20} />}
                    </AvatarFallback>
                </Avatar>
            </div>
            {role === 'igl' && (
                <div 
                    className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1 border-2 border-[#0B0C1A] shadow-lg"
                    aria-hidden="true"
                    title="In-Game Leader"
                >
                    <Shield className="w-2.5 h-2.5 text-white" />
                </div>
            )}
        </div>
    );
};
