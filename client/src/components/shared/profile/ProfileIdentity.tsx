import React from 'react';
import { Award } from 'lucide-react';

interface ProfileIdentityProps {
    avatarImage: string;
    name: string;
    tag?: string;
    isVerified?: boolean;
    description?: React.ReactNode;
    infoBlocks?: React.ReactNode;
    badges?: React.ReactNode;
}

/**
 * Avatar, Name, and Tag section of the profile header.
 */
export const ProfileIdentity = ({
    avatarImage,
    name,
    tag,
    isVerified,
    description,
    infoBlocks,
    badges
}: ProfileIdentityProps) => {
    return (
        <div className="flex flex-row items-start gap-4 md:gap-8 flex-1 min-w-0">
            {/* Standard Avatar Container */}
            <div className="relative group/avatar shrink-0 isolate -mt-4 md:-mt-8">
                <div className="w-28 h-28 md:w-40 md:h-40 rounded-full bg-[#0d091a] border-4 border-[#050505] overflow-hidden shadow-2xl relative z-10 transition-transform duration-500 group-hover/avatar:scale-[1.02]">
                    <img
                        src={avatarImage || "/assets/images/default-avatar.png"}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                </div>
                {/* Glow Effect Layer */}
                <div className="absolute -inset-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full blur opacity-20 group-hover/avatar:opacity-40 transition duration-500" />

                {isVerified && (
                    <div className="absolute p-1 bg-blue-500 rounded-full sm:p-2 bottom-0 right-0 sm:-bottom-2 sm:-right-2 z-20 shadow-xl border-4 border-[#050505]">
                        <Award className="w-3 h-3 text-white sm:w-4 sm:h-4" />
                    </div>
                )}
            </div>

            {/* Content Section: Name, Tag, Description, Info */}
            <div className="flex-1 min-w-0 flex flex-col gap-1.5 md:gap-3">
                <div className="flex flex-nowrap items-baseline justify-start gap-2 md:gap-4 min-w-0">
                    <h1 className="text-2xl sm:text-3xl md:text-6xl font-black tracking-tighter text-white leading-tight truncate min-w-0">
                        {name}
                    </h1>
                    {tag && (
                        <span className="text-[10px] sm:text-xs md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 shrink-0">
                            {tag.startsWith('#') ? tag : `#${tag}`}
                        </span>
                    )}
                </div>

                {/* Optional Bio/Description */}
                {description && (
                    <div className="max-w-2xl text-xs md:text-base text-white/40 font-medium leading-relaxed italic border-l-2 border-violet-500/20 pl-2 mx-0 line-clamp-2">
                        {description}
                    </div>
                )}

                {/* Optional Info Blocks (Stats, etc.) */}
                {infoBlocks && (
                    <div className="flex flex-nowrap items-center justify-start gap-4 min-w-0">
                        {infoBlocks}
                    </div>
                )}

                {/* Optional Badges */}
                {badges && (
                    <div className="flex flex-wrap items-center gap-2">
                        {badges}
                    </div>
                )}
            </div>
        </div>
    );
};
