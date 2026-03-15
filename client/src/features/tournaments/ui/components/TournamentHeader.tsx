import React from 'react';
import toast from 'react-hot-toast';
import { Link, NavigateFunction } from 'react-router-dom';
import { ArrowLeft, Share2, Heart, BadgeCheck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import { useLikeTournamentMutation } from '../../hooks/useTournamentMutations';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { cn } from '@/lib/utils';

interface TournamentHeaderProps {
    eventDetails: any;
    navigate: NavigateFunction;
}

export const TournamentHeader: React.FC<TournamentHeaderProps> = ({ eventDetails, navigate }) => {
    const { user } = useAuthStore();
    const likeMutation = useLikeTournamentMutation();
    const [copied, setCopied] = React.useState(false);

    // Unified Status Helper
    const getStatusLabel = () => {
        if (eventDetails.eventProgress === 'completed') return 'Completed';
        if (eventDetails.registrationStatus === 'registration-closed') return 'Closed';
        return 'Ongoing';
    };

    const getStatusColor = () => {
        if (eventDetails.eventProgress === 'completed') return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
        if (eventDetails.registrationStatus === 'registration-closed') return 'bg-rose-500/20 text-rose-400 border-rose-500/50';
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
    };

    const getStatusDotColor = () => {
        if (eventDetails.eventProgress === 'completed') return 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]';
        if (eventDetails.registrationStatus === 'registration-closed') return 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]';
        return 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]';
    };

    const handleLike = () => {
        if (!user) {
            toast.error("Please login to like this tournament");
            return;
        }
        likeMutation.mutate(eventDetails._id);
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(() => {
            toast.error("Failed to copy link");
        });
    };

    return (
        <div className="relative group mb-2 w-full h-[40vh] sm:h-[45vh] lg:h-[40vh]">
            {/* Immersive Full-Width Hero Banner */}
            <div className="absolute inset-0 overflow-hidden shadow-2xl">
                <img
                    src={eventDetails.image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform opacity-80"
                    style={{ transitionDuration: "2000ms" }}
                    alt={eventDetails.title}
                />

                {/* Edge Overlays (No Blur) */}
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-brand-black to-transparent z-10" />
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-black via-brand-black/80 to-transparent z-10" />

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-brand-black/60 via-transparent to-transparent opacity-40" />

                {/* Dynamic Content Overlay - Centered with max-w */}
                <div className="absolute inset-0 z-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-between py-6 sm:py-8">
                        {/* Top Bar inside Banner */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 sm:gap-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate(-1)}
                                    className="group h-auto flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-[8px] sm:text-[10px] font-black text-white transition-all uppercase tracking-widest hover:text-white"
                                >
                                    <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
                                    Back
                                </Button>

                                <div className="flex gap-2 sm:gap-3">
                                    <Badge variant="outline" className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border backdrop-blur-xl flex items-center gap-2 ${getStatusColor()}`}>
                                        <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${getStatusDotColor()}`} />
                                        <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em]">
                                            {getStatusLabel()}
                                        </span>
                                    </Badge>

                                    <Badge variant="outline" className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-purple-600/20 backdrop-blur-xl border border-purple-500/30 text-purple-200">
                                        <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em]">{eventDetails.game}</span>
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex gap-2 sm:gap-3">
                                <TooltipProvider>
                                    <Tooltip open={copied || undefined}>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={handleShare}
                                                aria-label="Share tournament"
                                                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white transition-all hover:text-white"
                                            >
                                                <Share2 size={16} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent
                                            side="bottom"
                                            className={cn(
                                                "text-[10px] font-bold uppercase tracking-widest border-none transition-colors",
                                                copied ? "bg-emerald-500 text-white" : "bg-zinc-800 text-gray-200"
                                            )}
                                        >
                                            {copied ? "Copied!" : "Copy"}
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleLike}
                                    disabled={likeMutation.isPending}
                                    aria-label={eventDetails.isLiked ? "Unlike tournament" : "Like tournament"}
                                    className={cn(
                                        "h-8 w-8 sm:h-10 sm:w-10 rounded-full backdrop-blur-md transition-all border",
                                        eventDetails.isLiked
                                            ? "text-rose-500 border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 hover:text-rose-500"
                                            : "bg-black/40 hover:bg-black/60 border-white/10 text-white hover:text-rose-500"
                                    )}
                                >
                                    <Heart
                                        size={16}
                                        fill={eventDetails.isLiked ? "currentColor" : "none"}
                                        className="transition-colors"
                                    />
                                </Button>
                            </div>
                        </div>

                        {/* Title at the Bottom */}
                        <div className="space-y-3 sm:space-y-4 max-w-5xl">
                            <div className="space-y-1 sm:space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-px w-6 sm:w-8 bg-orange-500/50" />

                                    <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em]">
                                        <span className="text-orange-400">{eventDetails.game}</span>{" "}
                                        {/* <span className="text-purple-500">Terminal</span> */}
                                    </span>
                                </div>
                                <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tightest leading-tight drop-shadow-2xl truncate whitespace-nowrap">
                                    {eventDetails.title}
                                </h1>
                                {eventDetails.orgId && (
                                    <div className="flex items-center gap-2 mt-1 px-1">
                                        <span className="text-[10px] sm:text-xs font-medium text-white/50 uppercase tracking-tighter">
                                            Organized by -
                                        </span>
                                        <Link
                                            to={`/organizer/${typeof eventDetails.orgId === 'object' ? eventDetails.orgId._id : eventDetails.orgId}`}
                                            className="group/org flex items-center gap-1.5"
                                        >
                                            <span className="text-[10px] sm:text-xs font-bold text-emerald-400 group-hover/org:text-emerald-300 transition-colors uppercase tracking-widest">
                                                {typeof eventDetails.orgId === 'object'
                                                    ? eventDetails.orgId.name
                                                    : "Gaming Hub"}
                                            </span>
                                            {eventDetails.orgId && typeof eventDetails.orgId === 'object' && eventDetails.orgId.isVerified && (
                                                <BadgeCheck size={14} className="text-blue-400 fill-blue-400/10 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                                            )}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="hidden sm:block absolute -bottom-6 -right-6 w-32 h-32 bg-purple-600/20 rounded-full blur-3xl group-hover:bg-purple-600/30 transition-colors" />
            <div className="hidden sm:block absolute -top-6 -left-6 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-600/30 transition-colors" />
        </div>
    );
};
