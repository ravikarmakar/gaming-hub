import React from 'react';
import { Award } from 'lucide-react';

interface UnifiedProfileHeaderProps {
    avatarImage: string;
    name: string;
    tag?: string;
    isVerified?: boolean;
    description?: React.ReactNode;
    badges?: React.ReactNode;
    metaInfo?: React.ReactNode;
    actions?: React.ReactNode;
    stats?: React.ReactNode;
}

/**
 * A standard header component for Player, Team, and Organizer profiles.
 * Consolidates the identity, description, stats, and action areas.
 */
export const UnifiedProfileHeader = ({
    avatarImage,
    name,
    tag,
    isVerified,
    description,
    badges,
    metaInfo,
    actions,
    stats
}: UnifiedProfileHeaderProps) => {
    return (
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Standard Avatar Container with Premium Effects */}
            <div className="relative group/avatar shrink-0 isolate">
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-3xl bg-[#0d091a] border-4 border-[#050505] overflow-hidden shadow-2xl relative z-10 transition-transform duration-500 group-hover/avatar:scale-[1.02]">
                    <img
                        src={avatarImage}
                        alt={name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a1b2e&color=fff&size=200`;
                        }}
                    />
                </div>
                {/* Glow Effect Layer */}
                <div className="absolute -inset-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-[2rem] blur opacity-20 group-hover/avatar:opacity-40 transition duration-500" />

                {isVerified && (
                    <div className="absolute p-1 bg-blue-500 rounded-full sm:p-2 -bottom-2 -right-2 z-20 shadow-xl border-4 border-[#050505]">
                        <Award className="w-3 h-3 text-white sm:w-4 sm:h-4" />
                    </div>
                )}
            </div>

            {/* Content Section: Name, Bio, Meta info */}
            <div className="flex-1 space-y-6 text-center md:text-left">
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-tight">
                            {name}
                        </h1>
                        {tag && (
                            <span className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                                {tag.startsWith('#') ? tag : `#${tag}`}
                            </span>
                        )}
                    </div>

                    {description && (
                        <div className="max-w-2xl text-white/40 font-medium leading-relaxed italic border-l-2 border-violet-500/20 pl-4 mx-auto md:mx-0">
                            {description}
                        </div>
                    )}

                    {badges && (
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            {badges}
                        </div>
                    )}
                </div>

                {/* Common Meta Info Bar (Region, Date, etc.) */}
                {metaInfo && (
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm md:text-base text-gray-400 font-semibold">
                        {metaInfo}
                    </div>
                )}

                {/* Optional Stats Highlights */}
                {stats && (
                    <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-2">
                        {stats}
                    </div>
                )}
            </div>

            {/* Actions Section: Specialized buttons (Join, Follow, etc.) */}
            <div className="flex flex-col sm:flex-row items-center gap-3 self-center md:self-start md:pt-4 w-full sm:w-auto">
                {actions}
            </div>
        </div>
    );
};
