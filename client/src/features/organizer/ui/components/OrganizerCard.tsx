import React, { useState } from "react";
import { Trophy, Users, ChevronRight, Building, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ORGANIZER_ROUTES } from "../../lib/routes";
import { Organizer } from "../../types";

interface OrganizerCardProps {
    organizer: Organizer;
    index: number;
}

const OrganizerCard = React.memo(React.forwardRef<HTMLDivElement, OrganizerCardProps>(({ organizer }, ref) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div ref={ref} className="group h-full">
            <Link
                to={organizer._id ? ORGANIZER_ROUTES.PROFILE.replace(":id", organizer._id) : "#"}
                onClick={(e) => !organizer._id && e.preventDefault()}
                className="block h-full overflow-hidden rounded-2xl bg-gray-900/40 border border-white/5 backdrop-blur-xl transition-all duration-500 hover:shadow-[0_0_30px_6px_rgba(147,51,234,0.12)] hover:border-purple-500/30 shadow-xl"
            >
                {/* Header: Logo + Status */}
                <div className="flex items-center gap-4 p-5 pb-4">
                    {/* Logo/Avatar */}
                    <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-[#0d091a] border border-white/10 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
                            <Avatar className="w-full h-full border-none">
                                <AvatarImage 
                                    src={organizer.imageUrl} 
                                    alt={organizer.name} 
                                    onLoadingStatusChange={(status) => setIsLoaded(status === 'loaded' || status === 'error')}
                                    className="object-cover" 
                                />
                                <AvatarFallback className="bg-purple-900/50 text-sm font-black text-purple-200">
                                    {organizer.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            {!isLoaded && organizer.imageUrl && <Skeleton className="absolute inset-0 z-10 w-full h-full rounded-full bg-white/10 animate-pulse" />}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 p-1 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 border-2 border-gray-900">
                            <Building className="w-2.5 h-2.5 text-white" />
                        </div>
                    </div>

                    {/* Name & Type */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors truncate leading-tight">
                            {organizer.name}
                        </h3>
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                            Organizer
                        </span>
                    </div>

                    {/* Status Badges */}
                    <div className="flex gap-1.5 flex-shrink-0">
                        <div className="p-1 rounded-full bg-blue-500/10 border border-blue-500/20" title="Active Organization">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        {organizer.isHiring && (
                            <div className="relative">
                                <div className="absolute -inset-1 bg-emerald-500/20 blur-sm rounded-full animate-pulse" />
                                <div className="relative p-1 rounded-full bg-emerald-500/10 border border-emerald-500/20" title="Hiring">
                                    <Building className="w-3.5 h-3.5 text-emerald-400" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div className="mx-5 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <p className="text-xs text-white/40 line-clamp-2 leading-relaxed italic">
                        "{organizer.description || "Crafting elite esports experiences and fostering professional competitive gaming."}"
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mx-5 mt-4 mb-4">
                    <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5 group/metric hover:bg-white/[0.06] transition-all">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                            <Trophy size={10} className="text-violet-400" /> Events
                        </p>
                        <p className="text-lg font-black text-white tracking-tight">--</p>
                    </div>
                    <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5 group/metric hover:bg-white/[0.06] transition-all">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                            <Users size={10} className="text-yellow-400" /> Members
                        </p>
                        <p className="text-lg font-black text-white tracking-tight">{organizer.members?.length || 0}</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mx-5 mb-5 pt-3 border-t border-white/5 flex items-center justify-end">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-purple-400 group-hover:text-purple-300 transition-colors">
                        View Organization <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </span>
                </div>
            </Link>
        </div>
    );
}));

OrganizerCard.displayName = "OrganizerCard";

export default OrganizerCard;
