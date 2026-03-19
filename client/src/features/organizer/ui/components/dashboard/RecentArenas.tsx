import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Gamepad2, PlusCircle, Calendar, DollarSign, Eye } from "lucide-react";
import { GlassCard, NeonBadge } from "@/features/tournaments/ui/components/shared/ThemedComponents";
import { ORGANIZER_ROUTES } from "@/features/organizer/lib/routes";
import { TOURNAMENT_ROUTES } from "@/features/tournaments/lib/routes";

interface RecentArenasProps {
    events: any[];
}

export const RecentArenas = ({ events }: RecentArenasProps) => {
    return (
        <div className="grid grid-cols-1 gap-4">
            {events.length === 0 ? (
                <GlassCard className="p-16 text-center border-dashed">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Gamepad2 className="w-8 h-8 text-gray-700" />
                    </div>
                    <p className="text-gray-400 font-medium">No active arenas found. Start your first tournament!</p>
                    <Link to={ORGANIZER_ROUTES.ADD_TOURNAMENTS} className="mt-6 inline-flex items-center gap-2 text-purple-400 font-bold hover:underline">
                        Create Arena <PlusCircle size={16} />
                    </Link>
                </GlassCard>
            ) : (
                events.map((event: any, index: number) => (
                    <motion.div
                        key={event._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <GlassCard className="p-4 group border-purple-500/5 hover:border-purple-500/20">
                            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                                <div className="relative w-full sm:w-24 h-20 rounded-xl overflow-hidden shrink-0 border border-white/10">
                                    <img src={event.image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070"} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C1A]/80 to-transparent" />
                                </div>

                                <div className="flex-1 min-w-0 w-full">
                                    <div className="flex items-center justify-between gap-4 mb-2">
                                        <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors truncate text-lg tracking-tight">{event.title}</h3>
                                        <NeonBadge variant={event.registrationStatus === "registration-open" ? "blue" : event.registrationStatus === "live" ? "red" : "green"}>
                                            {(event.registrationStatus || "unknown").replace('-', ' ')}
                                        </NeonBadge>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500 font-medium">
                                        <span className="flex items-center gap-2 uppercase tracking-widest text-[10px]"><Gamepad2 size={12} className="text-purple-400" />{event.game}</span>
                                        <span className="flex items-center gap-2 uppercase tracking-widest text-[10px]"><Calendar size={12} className="text-blue-400" />{new Date(event.startDate).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-2 uppercase tracking-widest text-[10px] text-emerald-400 font-bold"><DollarSign size={12} />${event.prizePool.toLocaleString()}</span>
                                    </div>
                                </div>

                                <Link to={TOURNAMENT_ROUTES.DETAILS(event._id)} className="w-full sm:w-auto p-3 rounded-xl bg-white/5 hover:bg-purple-500/20 text-purple-400 transition-all flex items-center justify-center group/view">
                                    <Eye size={18} className="transition-transform group-hover/view:scale-110 shadow-glow" />
                                </Link>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))
            )}
        </div>
    );
};
