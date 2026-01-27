import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { User, ShieldCheck, Gamepad2, Users, Star, Activity } from "lucide-react";
import { User as UserType } from "@/features/auth/store/useAuthStore";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PlayerCardProps {
    player: UserType;
    index: number;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, index }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const avatarUrl = player.avatar?.includes("default-avatar-url.com")
        ? `https://ui-avatars.com/api/?name=${player.username}&background=random`
        : (player.avatar || `https://ui-avatars.com/api/?name=${player.username}&background=random`);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5 }}
            className="group"
        >
            <Link
                to={`/player/${player._id}`}
                className="block relative h-full bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl p-6 hover:bg-white/[0.05] hover:border-violet-500/40 transition-all duration-500 overflow-hidden"
            >
                {/* Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />

                {/* Verification Badge */}
                {player.isAccountVerified && (
                    <div className="absolute top-5 right-5 z-10 p-1 rounded-full bg-blue-500/10 border border-blue-500/20 shadow-lg shadow-blue-500/10">
                        <ShieldCheck className="w-4 h-4 text-blue-400 fill-blue-400/20" />
                    </div>
                )}

                {/* Header: Avatar & Username */}
                <div className="flex flex-col items-center mb-8 pt-4 relative">
                    <div className="relative mb-5">
                        <div className="absolute -inset-2 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-full blur-md opacity-20 group-hover:opacity-60 transition duration-500" />
                        <div className="relative w-24 h-24 rounded-full bg-[#0d091a] border border-white/10 flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-105">
                            {!isLoaded && <Skeleton className="absolute inset-0 z-10 w-full h-full rounded-full bg-white/10 animate-pulse" />}
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt={player.username}
                                    onLoad={() => setIsLoaded(true)}
                                    loading="lazy"
                                    className={cn(
                                        "w-full h-full object-cover transition-all duration-700",
                                        isLoaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-sm scale-110"
                                    )}
                                />
                            ) : (
                                <User className="w-10 h-10 text-violet-400/40" />
                            )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 border-2 border-[#0d091a]">
                            <Gamepad2 className="w-3.5 h-3.5 text-white" />
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-black text-white group-hover:text-violet-300 transition-colors uppercase tracking-tight leading-none mb-1">
                            {player.username}
                        </h3>
                        <span className="text-[10px] font-bold text-violet-400/50 tracking-[0.2em] uppercase">
                            {player.esportsRole || "Warrior"}
                        </span>
                    </div>
                </div>

                {/* Team Status */}
                <div className="flex flex-col items-center gap-2 mb-8 p-3 rounded-2xl bg-white/[0.02] border border-white/5 group-hover:border-violet-500/20 transition-all duration-500">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-violet-400/70" />
                        <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">Team</span>
                    </div>
                    <span className="text-sm text-white font-bold">
                        {(player as any).teamId ? (player as any).teamId.teamName : "Free Agent"}
                    </span>
                    {(player as any).teamId && (
                        <span className="text-[10px] font-bold text-violet-400/50">#{(player as any).teamId.tag}</span>
                    )}
                </div>

                {/* Stats Summary (Placeholders for now) */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="flex flex-col items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400/70" />
                        <span className="text-[10px] text-white/40 uppercase font-black">Rating</span>
                        <span className="text-sm text-white font-bold">4.8</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <Activity className="w-4 h-4 text-cyan-400/70" />
                        <span className="text-[10px] text-white/40 uppercase font-black">MVP</span>
                        <span className="text-sm text-white font-bold">12</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-center pt-5 border-t border-white/5 relative">
                    <div className="flex items-center gap-1 text-[10px] font-black text-white/40 group-hover:text-violet-400 transition-all duration-500 uppercase tracking-tighter">
                        View Profile <span className="text-violet-500">→</span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default PlayerCard;
