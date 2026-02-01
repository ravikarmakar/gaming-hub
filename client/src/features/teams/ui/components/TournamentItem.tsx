import React from "react";
import { Link } from "react-router-dom";
import { Trophy, Calendar, Users, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { EVENT_ROUTES } from "@/features/events/lib/routes";
import { TournamentItemProps } from "../../lib/types";

export const TournamentItem = React.memo(({
    id,
    name,
    date,
    prize,
    status,
    placement,
    game,
    image,
    orgName,
    orgImage,
    type
}: TournamentItemProps) => {
    const statusStyles = {
        ongoing: "bg-red-500/10 text-red-400 border-red-500/20",
        upcoming: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        completed: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        eliminated: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    };

    return (
        <Link
            to={EVENT_ROUTES.TOURNAMENT_DETAILS.replace(":id", id)}
            className="group block relative bg-[#0F111A]/60 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 hover:bg-[#121421]/80 transition-all duration-500 shadow-2xl shadow-purple-500/5 backdrop-blur-xl"
        >
            {/* Aspect ratio container for banner */}
            <div className="relative h-32 w-full overflow-hidden">
                {image ? (
                    <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-900/40 to-indigo-900/40 flex items-center justify-center">
                        <Gamepad2 className="w-10 h-10 text-purple-400/20" />
                    </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F111A] via-[#0F111A]/20 to-transparent" />

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                    <span className={cn(
                        "text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border backdrop-blur-md tracking-tighter",
                        statusStyles[status]
                    )}>
                        {status}
                    </span>
                </div>

                {/* Placement Badge */}
                {placement && (
                    <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md border border-amber-500/30 rounded-lg px-2 py-1 flex items-center gap-1.5 shadow-lg">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs font-black text-white">#{placement}</span>
                    </div>
                )}
            </div>

            <div className="p-4 space-y-4">
                {/* Org & Game Info */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md border border-white/10 bg-zinc-900 overflow-hidden">
                            {orgImage ? (
                                <img src={orgImage} alt={orgName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Users className="w-3 h-3 text-gray-500" />
                                </div>
                            )}
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider line-clamp-1">{orgName || "Nexus Organizer"}</span>
                    </div>
                    {type && (
                        <span className="text-[9px] font-black text-purple-400/60 uppercase tracking-widest">{type}</span>
                    )}
                </div>

                {/* Title & Game */}
                <div>
                    <h3 className="text-base font-black text-white group-hover:text-purple-300 transition-colors leading-tight line-clamp-1 truncate">
                        {name}
                    </h3>
                    {game && (
                        <p className="text-[11px] font-medium text-gray-500 mt-0.5">{game}</p>
                    )}
                </div>

                {/* Footer Info */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1.5 text-gray-500">
                        <Calendar className="w-3.5 h-3.5 text-purple-400/50" />
                        <span className="text-[11px] font-bold">{date}</span>
                    </div>
                    <div>
                        <span className="text-xs text-gray-400 font-medium mr-1.5 uppercase tracking-tighter">Prize</span>
                        <span className="text-sm font-black text-emerald-400">
                            {typeof prize === 'number' ? `$${prize.toLocaleString()}` : prize}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
});
