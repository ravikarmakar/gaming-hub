import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Users,
    Clock,
    Gamepad2,
    TrendingUp,
    ChevronRight,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { TOURNAMENT_ROUTES } from "@/features/tournaments/lib/routes";
import { Tournament } from "@/features/tournaments/types";
import { cn, formatDate, formatCurrency } from "@/lib/utils";
import { GlassCard, NeonBadge } from "./ThemedComponents";

interface TournamentCardProps {
    event: Tournament;
    onButtonClick?: (eventId: string) => void;
    hideViewDetails?: boolean;
    hideActions?: boolean;
    index?: number;
}

const TournamentCard: React.FC<TournamentCardProps> = ({
    event,
    onButtonClick,
    hideViewDetails = false,
    hideActions = false,
    index = 0
}) => {
    const navigate = useNavigate();
    const [isLoaded, setIsLoaded] = useState(false);

    const handleCardClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        const button = target.closest('button');

        if (button && !button.innerText.includes('View Details') && !button.className.includes('group-hover/btn')) {
            return;
        }

        if (onButtonClick) {
            onButtonClick(event._id);
        } else {
            navigate(`${TOURNAMENT_ROUTES.TOURNAMENTS}/${event._id}`);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="h-full"
        >
            <GlassCard
                className="group h-full flex flex-row sm:flex-col cursor-pointer transition-all duration-500 hover:shadow-[0_0_40px_8px_rgba(147,51,234,0.15)] hover:border-purple-500/30 overflow-hidden"
                onClick={(e) => handleCardClick(e)}
            >
                {/* Event Hero */}
                <div className="relative w-24 sm:w-full h-full sm:h-48 overflow-hidden bg-white/5 shrink-0">
                    {!isLoaded && <Skeleton className="absolute inset-0 z-10 w-full h-full rounded-none bg-white/10 animate-pulse" />}
                    <img
                        src={event.image?.includes("default-avatar-url.com")
                            ? "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070"
                            : (event.image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070")
                        }
                        alt={event.title}
                        onLoad={() => setIsLoaded(true)}
                        loading="lazy"
                        className={cn(
                            "w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1",
                            isLoaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-sm"
                        )}
                    />
                    {/* Animated Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C1A] via-[#0B0C1A]/20 to-transparent" />

                    {/* Status Overlay */}
                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-2">
                        <NeonBadge
                            className="text-[8px] sm:text-[10px] px-1.5 py-0.5 sm:px-2 sm:py-1"
                            variant={
                                event.registrationStatus === "registration-open" ? "green" :
                                    event.eventProgress === "ongoing" ? "orange" :
                                        event.eventProgress === "completed" ? "blue" : "red"
                            }
                        >
                            {(event.registrationStatus === "registration-open" ? "Reg. Open" :
                                event.eventProgress === "ongoing" ? "Ongoing" :
                                    event.eventProgress === "completed" ? "Done" :
                                        event.registrationStatus || "Unknown"
                            ).toUpperCase()}
                        </NeonBadge>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
                        <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-purple-600/80 backdrop-blur-md rounded text-[8px] sm:text-[10px] font-bold text-white uppercase tracking-wider">
                            {event.category}
                        </span>
                    </div>
                </div>

                <div className="p-2 sm:p-4 xl:p-6 flex-1 flex flex-col min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 sm:mb-3 min-w-0">
                        <Gamepad2 size={12} className="text-purple-400 shrink-0 sm:w-3.5 sm:h-3.5" />
                        <span className="text-[8px] sm:text-[10px] xl:text-xs font-bold text-gray-500 uppercase tracking-widest truncate">{event.game}</span>
                    </div>

                    <h3 className="text-xs sm:text-lg xl:text-xl font-bold text-white mb-1 sm:mb-4 group-hover:text-purple-400 transition-colors line-clamp-1 sm:line-clamp-2">
                        {event.title}
                    </h3>

                    <div className="flex sm:grid sm:grid-cols-2 gap-2 sm:gap-2 xl:gap-4 mb-2 sm:mb-5 xl:mb-6">
                        <div className="flex sm:flex-col sm:bg-white/5 p-0 sm:p-2 xl:p-3 rounded-xl border-none sm:border sm:border-white/5 group/metric hover:bg-white/10 transition-all min-w-0">
                            <p className="hidden sm:flex text-[8px] xl:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 items-center gap-1 xl:gap-1.5 truncate">
                                <TrendingUp size={10} className="text-emerald-400 shrink-0" /> <span className="truncate">Prize</span>
                            </p>
                            <div className="flex items-center gap-1 sm:block">
                                <TrendingUp size={10} className="text-emerald-400 shrink-0 sm:hidden" />
                                <p className="text-sm sm:text-base xl:text-lg font-black text-white tracking-tight truncate">₹{formatCurrency(event.prizePool)}</p>
                            </div>
                        </div>
                        <div className="flex sm:flex-col sm:bg-white/5 p-0 sm:p-2 xl:p-3 rounded-xl border-none sm:border sm:border-white/5 group/metric hover:bg-white/10 transition-all min-w-0">
                            <p className="hidden sm:flex text-[8px] xl:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 items-center gap-1 xl:gap-1.5 truncate">
                                <Users size={10} className="text-blue-400 shrink-0" /> <span className="truncate">Enrolled</span>
                            </p>
                            <div className="flex flex-col gap-1.5 min-w-0">
                                <div className="flex items-center gap-1 sm:block">
                                    <Users size={10} className="text-blue-400 shrink-0 sm:hidden" />
                                    <p className="text-sm sm:text-base xl:text-lg font-black text-white tracking-tight truncate">{event.joinedSlots || 0}/{event.maxSlots}</p>
                                </div>
                                <div className="hidden sm:block">
                                    <Progress
                                    value={event.maxSlots > 0 ? Math.min(((event.joinedSlots || 0) / event.maxSlots) * 100, 100) : 0}
                                    className="hidden sm:block h-1 bg-white/10"
                                    indicatorClassName="bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                    {!hideActions && (
                        <div className={`mt-auto pt-2 sm:pt-4 border-t border-white/5 flex items-center ${hideViewDetails ? 'justify-start' : 'justify-between'} min-w-0`}>
                            <div className="flex flex-col gap-1 min-w-0 pr-2">
                                <div className="flex items-center gap-1 xl:gap-2 text-[9px] sm:text-xs text-gray-400 truncate">
                                    <Clock size={10} className="shrink-0 sm:w-3 sm:h-3" />
                                    <span className="truncate">{formatDate(event.startDate)}</span>
                                </div>
                            </div>
                            {!hideViewDetails && (
                                <Button
                                    variant="link"
                                    className="hidden sm:flex items-center gap-2 text-sm font-bold text-purple-400 hover:text-purple-300 group/btn p-0 h-auto"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCardClick(e);
                                    }}
                                >
                                    View Details <ChevronRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </GlassCard>
        </motion.div>
    );
};

export default TournamentCard;
