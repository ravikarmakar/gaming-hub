import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Users,
    Clock,
    Gamepad2,
    TrendingUp,
    ChevronRight,
    Edit2,
    Trash2
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import { GlassCard, NeonBadge } from "./ThemedComponents";
import { Event, EVENT_ROUTES } from "@/features/events/lib";
import { ORGANIZER_ROUTES } from "@/features/organizer/lib/routes";
import { cn } from "@/lib/utils";

interface TournamentCardProps {
    event: Event;
    onButtonClick?: (eventId: string) => void;
    onDeleteClick?: (eventId: string) => void;
    showEditButton?: boolean;
    hideViewDetails?: boolean;
    hideActions?: boolean;
    index?: number;
}

const TournamentCard: React.FC<TournamentCardProps> = ({
    event,
    onButtonClick,
    onDeleteClick,
    showEditButton = false,
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
            navigate(`${EVENT_ROUTES.TOURNAMENTS}/${event._id}`);
        }
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(ORGANIZER_ROUTES.EDIT_TOURNAMENT.replace(":eventId", event._id));
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onDeleteClick) {
            onDeleteClick(event._id);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <GlassCard
                className="group h-full flex flex-col cursor-pointer"
                onClick={(e) => handleCardClick(e)}
            >
                {/* Event Hero */}
                <div className="relative h-48 overflow-hidden bg-white/5">
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
                            "w-full h-full object-cover transition-all duration-700 group-hover:scale-110",
                            isLoaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-sm"
                        )}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C1A] via-transparent to-transparent opacity-60" />

                    {/* Status Overlay */}
                    <div className="absolute top-4 right-4 flex gap-2">
                        {showEditButton && !hideActions && (
                            <TooltipProvider>
                                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                type="button"
                                                onClick={handleEditClick}
                                                className="h-8 w-8 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-purple-600/80 hover:text-white transition-all p-0"
                                            >
                                                <Edit2 size={14} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-[#0B0C1A] border-white/10 text-white">
                                            <p>Edit Tournament</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                type="button"
                                                onClick={handleDeleteClick}
                                                className="h-8 w-8 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all p-0"
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-[#0B0C1A] border-white/10 text-white">
                                            <p>Delete Tournament</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </TooltipProvider>
                        )}
                        <NeonBadge
                            variant={
                                event.status === "registration-open" ? "green" :
                                    event.status === "live" ? "orange" :
                                        event.status === "completed" ? "blue" : "red"
                            }
                        >
                            {event.status.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </NeonBadge>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                        <span className="px-2 py-1 bg-purple-600/80 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase tracking-wider">
                            {event.category}
                        </span>
                    </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                        <Gamepad2 size={14} className="text-purple-400" />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{event.game}</span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors line-clamp-1">
                        {event.title}
                    </h3>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5 group/metric hover:bg-white/10 transition-all">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                <TrendingUp size={10} className="text-emerald-400" /> Prize Pool
                            </p>
                            <p className="text-lg font-black text-white tracking-tight">₹{event.prizePool?.toLocaleString() || "0"}</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5 group/metric hover:bg-white/10 transition-all">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                <Users size={10} className="text-blue-400" /> Enrolled
                            </p>
                            <div className="flex flex-col gap-1.5">
                                <p className="text-lg font-black text-white tracking-tight">{event.joinedSlots || 0}/{event.maxSlots}</p>
                                <Progress
                                    value={Math.min(((event.joinedSlots || 0) / event.maxSlots) * 100, 100)}
                                    className="h-1 bg-white/10"
                                    indicatorClassName="bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className={`mt-auto pt-4 border-t border-white/5 flex items-center ${hideViewDetails ? 'justify-start' : 'justify-between'}`}>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Clock size={12} />
                                <span>{new Date(event.startDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                        {!hideViewDetails && (
                            <Button
                                variant="link"
                                className="flex items-center gap-2 text-sm font-bold text-purple-400 hover:text-purple-300 group/btn p-0 h-auto"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCardClick(e);
                                }}
                            >
                                View Details <ChevronRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                            </Button>
                        )}
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
};

export default TournamentCard;
